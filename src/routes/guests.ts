import { Router, Request, Response } from 'express';
import { query } from '../database';
import { createGuestSchema } from '../schemas/guest';

const router = Router();

// Criar nova confirmação de presença
router.post('/guests', async (req: Request, res: Response) => {
  try {
    console.log('[POST /guests] Dados recebidos:', JSON.stringify(req.body, null, 2));
    
    const { error, value } = createGuestSchema.validate(req.body);
    
    if (error) {
      console.log('[POST /guests] Erro de validação:', error.message);
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    console.log('[POST /guests] Dados validados:', JSON.stringify(value, null, 2));

    // Verificar se já existe alguém com o mesmo nome
    const existingGuest = await query(
      'SELECT id FROM guests WHERE LOWER(name) = LOWER($1)',
      [value.name]
    );

    if (existingGuest.rows.length > 0) {
      return res.status(409).json({ 
        error: 'Você já confirmou presença! Para alterar, entre em contato via WhatsApp.' 
      });
    }

    // Inserir convidado
    console.log('[POST /guests] Inserindo convidado:', {
      name: value.name,
      age: value.age,
      phone: value.phone,
      hasChildren: value.hasChildren,
      willStay: value.willStay,
      arrivalDay: value.arrivalDay,
    });

    const guestResult = await query(
      `INSERT INTO guests (name, age, phone, has_children, will_stay, arrival_day) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING id, name, confirmed_at`,
      [
        value.name,
        value.age,
        value.phone,
        value.hasChildren,
        value.willStay,
        value.arrivalDay || null,
      ]
    );

    const guestId = guestResult.rows[0].id;
    console.log('[POST /guests] ✅ Convidado inserido com sucesso. ID:', guestId);

    // Inserir filhos (se houver)
    if (value.hasChildren && value.children && value.children.length > 0) {
      for (const child of value.children) {
        await query(
          `INSERT INTO children (guest_id, name, age) 
           VALUES ($1, $2, $3)`,
          [
            guestId,
            child.name,
            child.age,
          ]
        );
      }
    }

    res.status(201).json({
      message: 'Presença confirmada com sucesso!',
      guest: {
        id: guestId,
        name: guestResult.rows[0].name,
        confirmedAt: guestResult.rows[0].confirmed_at,
      }
    });
  } catch (error) {
    console.error('[POST /guests] ❌ Erro ao processar:', {
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : '',
      name: error instanceof Error ? error.name : '',
    });
    res.status(500).json({ 
      error: 'Erro ao confirmar presença. Tente novamente.' 
    });
  }
});

// Listar todas as confirmações com estatísticas
router.get('/guests', async (req: Request, res: Response) => {
  try {
    const statsResult = await query('SELECT * FROM guest_stats');
    const stats = statsResult.rows[0];

    const guestsResult = await query(
      `SELECT g.*, 
              (SELECT json_agg(json_build_object('id', id, 'name', name, 'age', age, 'willStay', will_stay, 'arrivalDay', arrival_day)) 
               FROM children WHERE guest_id = g.id) as children
       FROM guests g
       ORDER BY g.confirmed_at DESC`
    );

    res.json({
      stats: {
        totalGuests: stats.total_guests,
        guestWhoWillStay: stats.guests_staying,
        childrenCount: stats.total_children,
      },
      guests: guestsResult.rows,
    });
  } catch (error) {
    console.error('Erro ao listar confirmações:', error);
    res.status(500).json({ 
      error: 'Erro ao listar confirmações.' 
    });
  }
});

// Obter detalhes de um convidado
router.get('/guests/:id', async (req: Request, res: Response) => {
  try {
    const guestResult = await query(
      `SELECT g.*, 
              (SELECT json_agg(json_build_object('id', id, 'name', name, 'age', age, 'willStay', will_stay, 'arrivalDay', arrival_day)) 
               FROM children WHERE guest_id = g.id) as children
       FROM guests g
       WHERE g.id = $1`,
      [req.params.id]
    );

    if (guestResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Convidado não encontrado.' 
      });
    }

    res.json(guestResult.rows[0]);
  } catch (error) {
    console.error('Erro ao buscar convidado:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar convidado.' 
    });
  }
});

// Atualizar confirmação
router.put('/guests/:id', async (req: Request, res: Response) => {
  try {
    const { error, value } = createGuestSchema.validate(req.body);
    
    if (error) {
      return res.status(400).json({ 
        error: error.details[0].message 
      });
    }

    // Atualizar convidado
    const guestResult = await query(
      `UPDATE guests 
       SET name = $1, age = $2, has_children = $3, will_stay = $4, arrival_day = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING id, name`,
      [
        value.name,
        value.age,
        value.hasChildren,
        value.willStay,
        value.arrivalDay || null,
        req.params.id,
      ]
    );

    if (guestResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Convidado não encontrado.' 
      });
    }

    // Remover filhos antigos
    await query('DELETE FROM children WHERE guest_id = $1', [req.params.id]);

    // Inserir novos filhos
    if (value.hasChildren && value.children && value.children.length > 0) {
      for (const child of value.children) {
        await query(
          `INSERT INTO children (guest_id, name, age, will_stay, arrival_day) 
           VALUES ($1, $2, $3, $4, $5)`,
          [
            req.params.id,
            child.name,
            child.age,
            child.willStay,
            child.arrivalDay || null,
          ]
        );
      }
    }

    res.json({
      message: 'Confirmação atualizada com sucesso!',
      guest: guestResult.rows[0],
    });
  } catch (error) {
    console.error('Erro ao atualizar confirmação:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar confirmação.' 
    });
  }
});

// Deletar confirmação
router.delete('/guests/:id', async (req: Request, res: Response) => {
  try {
    // Deletar filhos primeiro (por causa da foreign key)
    await query('DELETE FROM children WHERE guest_id = $1', [req.params.id]);
    
    // Deletar convidado
    const guestResult = await query(
      'DELETE FROM guests WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (guestResult.rows.length === 0) {
      return res.status(404).json({ 
        error: 'Convidado não encontrado.' 
      });
    }

    res.json({
      message: 'Confirmação removida com sucesso!',
    });
  } catch (error) {
    console.error('Erro ao deletar confirmação:', error);
    res.status(500).json({ 
      error: 'Erro ao deletar confirmação.' 
    });
  }
});

export default router;
