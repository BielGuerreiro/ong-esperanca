CREATE DATABASE ong_esperanca;
USE ong_esperanca;

-- 1. Tabela de Residentes (Chave Primária e FKs N:1)
CREATE TABLE residentes (
    id_residente INT PRIMARY KEY AUTO_INCREMENT,
    primeiro_nome VARCHAR(50) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    documento VARCHAR(255),
    sexo ENUM('masculino', 'feminino') NOT NULL,
    data_nascimento DATE NOT NULL,
    num_sus VARCHAR(15),
    etnia VARCHAR(20) NOT NULL,
    pcd ENUM('sim', 'nao') NOT NULL,
    tipo_sanguinio VARCHAR(5),
    data_entrada DATE NOT NULL,
    data_saida DATE,
    frequenta_escola ENUM('sim', 'nao') NOT NULL,
    doencas TEXT,
    vacinas TEXT,
    alergias TEXT,
    descricao TEXT,
    escola_id_escola INT,
    FOREIGN KEY (escola_id_escola) REFERENCES escolas (id_escola)
);

select * from funcionarios;
select * from atividades;
select * from estoque;
select * from residentes;
select * from escolas;
select * from enderecos;
select * from responsaveis;
select * from medicamentos;
select * from relatorios;

-- 2. Tabela de Funcionários (Chave Primária e FKs N:1)
CREATE TABLE funcionarios (
    id_funcionario INT PRIMARY KEY AUTO_INCREMENT,
    numero_registro varchar (20) null UNIQUE,
    primeiro_nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    cpf CHAR(14) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL,
    sexo ENUM('masculino', 'feminino') NOT NULL,
    telefone VARCHAR(15),
    email VARCHAR(255) NOT NULL UNIQUE,
    cargo VARCHAR(100) NOT NULL,
    data_admissao DATE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel_acesso ENUM('funcionario', 'gerente') NOT NULL,
    turno ENUM('manha', 'tarde', 'noite') NOT NULL,
    status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
    descricao TEXT,
    estoque_id_estoque INT,
    FOREIGN KEY (estoque_id_estoque) REFERENCES estoque(id_estoque)
) AUTO_INCREMENT=101;


-- 3. Tabela de Responsáveis (Apenas Chave Primária)
CREATE TABLE responsaveis (
    id_responsavel INT PRIMARY KEY AUTO_INCREMENT,
    primeiro_nome VARCHAR(100) NOT NULL,
    sobrenome VARCHAR(100) NOT NULL,
    data_nascimento DATE NOT NULL,
    sexo ENUM('masculino', 'feminino') NOT NULL,
    cpf VARCHAR(14),
    estado_civil VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    telefone VARCHAR(15) NOT NULL,
    parentesco VARCHAR(50) NOT NULL
);

-- 4. Tabela de Tratamentos (Medicamentos) (Apenas Chave Primária)
CREATE TABLE medicamentos (
    id_tratamento INT PRIMARY KEY AUTO_INCREMENT,
    nome_medicamento VARCHAR(255) NOT NULL,
    dosagem VARCHAR(50) NOT NULL,
    tipo VARCHAR(50),
    horario TIME NOT NULL,
    frequencia varchar (100),
    duracao varchar (50) NOT NULL,
    data_vencimento date NOT NULL
);

-- 5. Tabela de Atividades (Apenas Chave Primária)
CREATE TABLE atividades (
    id_atividade INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL,
    categoria_atividade VARCHAR(50) NOT NULL,
    local_atividade VARCHAR(255) NOT NULL,
    data_atividade DATE NOT NULL,
    horario TIME NOT NULL,
    duracao VARCHAR(50),
    responsavel_atividade VARCHAR(255) NOT NULL,
    status ENUM('Agendada', 'Concluída', 'Cancelada') NOT NULL DEFAULT 'Agendada'
);

-- 6. Tabela de Registros de Evolução (Relatórios)
CREATE TABLE relatorios (
    id_relatorio INT PRIMARY KEY AUTO_INCREMENT,
    residente_id_residente INT NOT NULL,
    funcionario_id_funcionario INT NOT NULL,
    data_relatorio DATE NOT NULL,
    descricao_social TEXT,
    evolucao_social VARCHAR(50),
    descricao_pedagogica TEXT,
    evolucao_pedagogica VARCHAR(50),
    descricao_psicologica TEXT,
    evolucao_psicologica VARCHAR(50),
    descricao_saude TEXT,
    evolucao_saude VARCHAR(50),
    descricao_fisica TEXT,
    evolucao_fisica VARCHAR(50),
    descricao_comunicacao TEXT,
    evolucao_comunicacao VARCHAR(50),
    medicamento VARCHAR(255),
    horaMedicacao TIME,
    statusMedicacao VARCHAR(20),
    descricao_geral TEXT,
    responsavel_nome_registro VARCHAR(255) NOT NULL,
	status ENUM('Pendente', 'Administrado') NOT NULL DEFAULT 'Pendente',
    FOREIGN KEY (residente_id_residente) REFERENCES residentes(id_residente) ON DELETE CASCADE,
    FOREIGN KEY (funcionario_id_funcionario) REFERENCES funcionarios(id_funcionario)
);

-- 7. Tabela de Endereços (Deve ser criada primeiro)
CREATE TABLE enderecos (
    id_endereco INT PRIMARY KEY AUTO_INCREMENT,
    cep CHAR(9) NOT NULL,
    rua VARCHAR(255) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(100),
    bairro VARCHAR(100) NOT NULL,
    cidade VARCHAR(100) NOT NULL,
    uf CHAR(2) NOT NULL
);

-- 8. Tabela de Escola do residente (Relação 1:1/1:N com Endereços - Pertence)
CREATE TABLE escolas (
    id_escola INT auto_increment PRIMARY KEY,
    escola_nome VARCHAR(255),
    endereco_id_endereco INT,
    FOREIGN KEY (endereco_id_endereco) REFERENCES enderecos(id_endereco)
);

-- 9. Tabela de Estoque de Medicamentos (Deve ser criada cedo)
CREATE TABLE estoque (
    id_estoque INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(255) NOT NULL UNIQUE,
    quantidade INT NOT NULL DEFAULT 0
);

-- ___________________________________________________________________________________________________________________

-- 10. Tabela associativa: (Residente para Funcionário)
CREATE TABLE coordena (
    funcionario_id_funcionario INT NOT NULL,
    residente_id_residente INT NOT NULL,
    PRIMARY KEY (funcionario_id_funcionario, residente_id_residente),
    FOREIGN KEY (funcionario_id_funcionario) REFERENCES funcionarios(id_funcionario) ON DELETE CASCADE,
    FOREIGN KEY (residente_id_residente) REFERENCES residentes(id_residente) ON DELETE CASCADE
);

-- 11. Tabela associativa: (Residente para Responsáveis)
CREATE TABLE tem (
    residente_id_residente INT NOT NULL,
    responsavel_id_responsavel INT NOT NULL,
    PRIMARY KEY (residente_id_residente, responsavel_id_responsavel),
    FOREIGN KEY (residente_id_residente) REFERENCES residentes(id_residente) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id_responsavel) REFERENCES responsaveis(id_responsavel) ON DELETE CASCADE
);

-- 12. Tabela associativa: (Residente para Atividades)
CREATE TABLE faz (
    residente_id_residente INT NOT NULL,
    atividade_id_atividade INT NOT NULL,
    data_registro DATE, -- Campo adicional para registrar quando a atividade foi feita
    PRIMARY KEY (residente_id_residente, atividade_id_atividade),
    FOREIGN KEY (residente_id_residente) REFERENCES residentes(id_residente) ON DELETE CASCADE,
    FOREIGN KEY (atividade_id_atividade) REFERENCES atividades(id_atividade) ON DELETE CASCADE
);

-- 13. Tabela associativa: (Residente para Medicamentos)
CREATE TABLE recebe (
    residente_id_residente INT NOT NULL,
    medicamento_id_tratamento INT NOT NULL,
    data_prescricao DATE, -- Campo para registrar a data da prescrição
    PRIMARY KEY (residente_id_residente, medicamento_id_tratamento),
    FOREIGN KEY (residente_id_residente) REFERENCES residentes(id_residente) ON DELETE CASCADE,
    FOREIGN KEY (medicamento_id_tratamento) REFERENCES medicamentos(id_tratamento) ON DELETE CASCADE
);

-- 14. Tabela associativa:(Funcionário para Endereço)
CREATE TABLE contem (
    funcionario_id_funcionario INT NOT NULL,
    endereco_id_endereco INT NOT NULL,
    PRIMARY KEY (funcionario_id_funcionario, endereco_id_endereco),
    FOREIGN KEY (funcionario_id_funcionario) REFERENCES funcionarios(id_funcionario) ON DELETE CASCADE,
    FOREIGN KEY (endereco_id_endereco) REFERENCES enderecos(id_endereco) ON DELETE CASCADE
);

-- 15. Tabela associativa: (Endereço para Residente)
CREATE TABLE abriga (
    endereco_id_endereco INT NOT NULL,
    residente_id_residente INT NOT NULL,
    PRIMARY KEY (endereco_id_endereco, residente_id_residente),
    FOREIGN KEY (endereco_id_endereco) REFERENCES enderecos(id_endereco) ON DELETE CASCADE,
    FOREIGN KEY (residente_id_residente) REFERENCES residentes(id_residente) ON DELETE CASCADE
);

-- 16. Tabela associativa: (Endereço para Responsáveis)
CREATE TABLE detem (
    endereco_id_endereco INT NOT NULL,
    responsavel_id_responsavel INT NOT NULL,
    PRIMARY KEY (endereco_id_endereco, responsavel_id_responsavel),
    FOREIGN KEY (endereco_id_endereco) REFERENCES enderecos(id_endereco) ON DELETE CASCADE,
    FOREIGN KEY (responsavel_id_responsavel) REFERENCES responsaveis(id_responsavel) ON DELETE CASCADE
);
