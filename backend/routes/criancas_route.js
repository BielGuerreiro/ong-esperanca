import express from 'express'
import connection from '../config/database.js'

//  CRUD CRIANÇAS -- check all //

const router = express.Router()

// Conta o total de crianças
router.get('/count', (req, res) => {
  const sql = 'SELECT COUNT(*) AS total FROM crianca';
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao contar residentes');
    }
    res.json({ total: results[0].total });
  });
});


// Lista todas as crianças
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM crianca ORDER BY primeiro_nome, sobrenome'
  
  connection.query(sql, (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar dados')
    }
    res.json(results)
  })
})

//Busca crianças por nome
router.get('/nome/:nome', (req, res) => {
  const { nome } = req.params
  const sql = `SELECT * FROM crianca 
               WHERE primeiro_nome LIKE ? 
               OR sobrenome LIKE ? 
               ORDER BY primeiro_nome`
  const searchTerm = `%${nome}%`
  
  connection.query(sql, [searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar crianças')
    }
    res.json(results)
  })
})

// Busca criança por ID
router.get('/:id', (req, res) => {
  const { id } = req.params
  const sql = 'SELECT * FROM crianca WHERE id = ?'
  
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao buscar criança')
    }
    if (results.length === 0) {
      return res.status(404).send('Criança não encontrada')
    }
    res.json(results[0])
  })
})

// Cria nova criança


router.post('/', (req, res) => {
  const {
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento,
    frequenta_escola, nome_escola, rua_escola, numero_escola, bairro_escola,
    possui_responsavel, responsavel_primeiro_nome, responsavel_sobrenome, responsavel_nascimento,
    responsavel_cpf, responsavel_sexo, responsavel_parentesco, responsavel_telefone,
    endereco_responsavel_igual, responsavel_cep, responsavel_rua, responsavel_numero,
    responsavel_bairro, responsavel_cidade, responsavel_uf, responsavel_complemento,
    doencas, vacinas
  } = req.body;

  const sql = `
    INSERT INTO crianca (
      primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
      data_nascimento, etnia, alergias, numero_SUS, PCD,
      data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento,
      frequenta_escola, nome_escola, rua_escola, numero_escola, bairro_escola,
      possui_responsavel, responsavel_primeiro_nome, responsavel_sobrenome, responsavel_nascimento,
      responsavel_cpf, responsavel_sexo, responsavel_parentesco, responsavel_telefone,
      endereco_responsavel_igual, responsavel_cep, responsavel_rua, responsavel_numero,
      responsavel_bairro, responsavel_cidade, responsavel_uf, responsavel_complemento,
      doencas, vacinas
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  const values = [
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento,
    frequenta_escola, nome_escola, rua_escola, numero_escola, bairro_escola,
    possui_responsavel, responsavel_primeiro_nome, responsavel_sobrenome, responsavel_nascimento,
    responsavel_cpf, responsavel_sexo, responsavel_parentesco, responsavel_telefone,
    endereco_responsavel_igual, responsavel_cep, responsavel_rua, responsavel_numero,
    responsavel_bairro, responsavel_cidade, responsavel_uf, responsavel_complemento,
    doencas, vacinas
  ];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao cadastrar criança');
    }
    res.status(201).json({ message: 'Criança cadastrada com sucesso!', id: results.insertId });
  });
});


//Atualiza criança
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const {
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento,
    frequenta_escola, nome_escola, rua_escola, numero_escola, bairro_escola,
    possui_responsavel, responsavel_primeiro_nome, responsavel_sobrenome, responsavel_nascimento,
    responsavel_cpf, responsavel_sexo, responsavel_parentesco, responsavel_telefone,
    endereco_responsavel_igual, responsavel_cep, responsavel_rua, responsavel_numero,
    responsavel_bairro, responsavel_cidade, responsavel_uf, responsavel_complemento,
    doencas, vacinas
  } = req.body;

  const sql = `
    UPDATE crianca SET 
      primeiro_nome=?, sobrenome=?, CPF=?, documento=?, descricao=?, sexo=?, data_nascimento=?, etnia=?, alergias=?, numero_SUS=?, PCD=?,
      data_entrada=?, data_saida=?, tipo_sanguineo=?, cep=?, rua=?, numero=?, bairro=?, cidade=?, uf=?, complemento=?,
      frequenta_escola=?, nome_escola=?, rua_escola=?, numero_escola=?, bairro_escola=?,
      possui_responsavel=?, responsavel_primeiro_nome=?, responsavel_sobrenome=?, responsavel_nascimento=?,
      responsavel_cpf=?, responsavel_sexo=?, responsavel_parentesco=?, responsavel_telefone=?,
      endereco_responsavel_igual=?, responsavel_cep=?, responsavel_rua=?, responsavel_numero=?,
      responsavel_bairro=?, responsavel_cidade=?, responsavel_uf=?, responsavel_complemento=?,
      doencas=?, vacinas=?
    WHERE id=?`;

  const values = [
    primeiro_nome, sobrenome, CPF, documento, descricao, sexo,
    data_nascimento, etnia, alergias, numero_SUS, PCD,
    data_entrada, data_saida, tipo_sanguineo, cep, rua, numero, bairro, cidade, uf, complemento,
    frequenta_escola, nome_escola, rua_escola, numero_escola, bairro_escola,
    possui_responsavel, responsavel_primeiro_nome, responsavel_sobrenome, responsavel_nascimento,
    responsavel_cpf, responsavel_sexo, responsavel_parentesco, responsavel_telefone,
    endereco_responsavel_igual, responsavel_cep, responsavel_rua, responsavel_numero,
    responsavel_bairro, responsavel_cidade, responsavel_uf, responsavel_complemento,
    doencas, vacinas, id
  ];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao atualizar criança');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Criança não encontrada');
    }
    res.json({ message: 'Criança atualizada com sucesso!' });
  });
});


// Atualiza apenas dados escolares
router.put('/:id/escola', (req, res) => {
  const { id } = req.params;
  const {
    frequenta_escola,
    nome_escola,
    rua_escola,
    numero_escola,
    bairro_escola
  } = req.body;

  const sql = `
    UPDATE crianca SET 
      frequenta_escola = ?, 
      nome_escola = ?, 
      rua_escola = ?, 
      numero_escola = ?, 
      bairro_escola = ?
    WHERE id = ?`;

  const values = [
    frequenta_escola,
    nome_escola,
    rua_escola,
    numero_escola,
    bairro_escola,
    id
  ];

  connection.query(sql, values, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao atualizar informações escolares');
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Criança não encontrada');
    }
    res.json({ message: 'Informações escolares atualizadas com sucesso!' });
  });
});

// Retorna apenas dados escolares
router.get('/:id/escola', (req, res) => {
  const { id } = req.params;
  const sql = `
    SELECT frequenta_escola, nome_escola, rua_escola, numero_escola, bairro_escola
    FROM crianca
    WHERE id = ?`;

  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao buscar dados escolares');
    }
    if (results.length === 0) {
      return res.status(404).send('Criança não encontrada');
    }
    res.json(results[0]);
  });
});


//Excluir criança
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const sql = 'DELETE FROM crianca WHERE id = ?'
  
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err)
      return res.status(500).send('Erro ao excluir criança')
    }
    if (results.affectedRows === 0) {
      return res.status(404).send('Criança não encontrada')
    }
    res.json({ message: 'Criança excluída com sucesso!' })
  })
})

export default router