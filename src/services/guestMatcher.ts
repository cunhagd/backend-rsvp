import { query } from '../database';

// Algoritmo de Levenshtein Distance (distância edit)
function levenshteinDistance(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }

  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  return track[str2.length][str1.length];
}

// Calcular similarity entre 0 e 1
function getSimilarity(str1: string, str2: string): number {
  const maxLength = Math.max(str1.length, str2.length);
  if (maxLength === 0) return 1;
  
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
  return 1 - (distance / maxLength);
}

// Normalizar nome (remover acentos, espaços extras)
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

// Buscar match na tabela expected_guests
async function findMatchingExpectedGuest(guestName: string): Promise<{ id: number; name: string; similarity: number } | null> {
  try {
    console.log('🔍 Buscando match para:', guestName);

    // Buscar todos os convidados esperados
    const result = await query(
      'SELECT id, name FROM expected_guests ORDER BY name ASC'
    );

    if (result.rows.length === 0) {
      console.log('⚠️  Nenhum convidado esperado encontrado');
      return null;
    }

    // Normalizar o nome do convidado que confirmou
    const normalizedGuest = normalizeName(guestName);

    // Encontrar o melhor match
    let bestMatch = null;
    let bestSimilarity = 0;
    const threshold = 0.75; // 75% de similaridade mínima

    for (const expected of result.rows) {
      const normalizedExpected = normalizeName(expected.name);
      const similarity = getSimilarity(normalizedGuest, normalizedExpected);

      console.log(`  ${expected.name}: ${(similarity * 100).toFixed(1)}%`);

      if (similarity > bestSimilarity) {
        bestSimilarity = similarity;
        bestMatch = {
          id: expected.id,
          name: expected.name,
          similarity,
        };
      }
    }

    if (bestMatch && bestSimilarity >= threshold) {
      console.log(`✅ Match encontrado: ${bestMatch.name} (${(bestSimilarity * 100).toFixed(1)}%)`);
      return bestMatch;
    } else if (bestMatch) {
      console.log(`⚠️  Melhor match: ${bestMatch.name} (${(bestSimilarity * 100).toFixed(1)}%) - Abaixo do threshold`);
    }

    return null;
  } catch (error) {
    console.error('❌ Erro ao buscar match:', error);
    return null;
  }
}

// Linking automático quando guest é criado
async function linkGuestToExpected(guestId: number, guestName: string): Promise<boolean> {
  try {
    const match = await findMatchingExpectedGuest(guestName);

    if (!match) {
      console.log('⚠️  Nenhum match encontrado para linking');
      return false;
    }

    // Atualizar guest com expected_guest_id
    await query(
      'UPDATE guests SET expected_guest_id = $1 WHERE id = $2',
      [match.id, guestId]
    );

    console.log(`✅ Convidado ${guestName} linkedado com ${match.name} (ID: ${match.id})`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao linkar convidado:', error);
    return false;
  }
}

export { findMatchingExpectedGuest, linkGuestToExpected, getSimilarity, normalizeName };
