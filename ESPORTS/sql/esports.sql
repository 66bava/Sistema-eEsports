CREATE DATABASE esports;

USE esports;

CREATE TABLE campeonatos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    jogo VARCHAR(80) NOT NULL,
    formato VARCHAR(50) NOT NULL,
    limite_equipes INT NOT NULL,
    valor_inscricao DECIMAL(10,2) DEFAULT 0,
    premio DECIMAL(10,2) DEFAULT 0,
    data_inicio DATE NOT NULL,
    status VARCHAR(30) DEFAULT 'Aberto'
);

CREATE TABLE equipes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    tag VARCHAR(10) NOT NULL,
    jogo VARCHAR(80) NOT NULL,
    quantidade_jogadores INT NOT NULL,
    regiao VARCHAR(50) NOT NULL,
    cidade VARCHAR(100)
);

CREATE TABLE jogadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_equipe INT,
    nome VARCHAR(100) NOT NULL,
    nickname VARCHAR(50) NOT NULL,
    idade INT,
    cidade VARCHAR(100),
    nivel VARCHAR(50),
    FOREIGN KEY (id_equipe) REFERENCES equipes(id)
);

CREATE TABLE inscricoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_campeonato INT NOT NULL,
    id_equipe INT NOT NULL,
    data_inscricao DATE,
    status VARCHAR(30) DEFAULT 'Confirmada',
    FOREIGN KEY (id_campeonato) REFERENCES campeonatos(id),
    FOREIGN KEY (id_equipe) REFERENCES equipes(id)
);

CREATE TABLE partidas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_campeonato INT NOT NULL,
    id_equipe_1 INT NOT NULL,
    id_equipe_2 INT NOT NULL,
    placar_equipe_1 INT DEFAULT 0,
    placar_equipe_2 INT DEFAULT 0,
    data_partida DATETIME NOT NULL,
    rodada INT,
    status VARCHAR(30) DEFAULT 'Agendada',
    FOREIGN KEY (id_campeonato) REFERENCES campeonatos(id),
    FOREIGN KEY (id_equipe_1) REFERENCES equipes(id),
    FOREIGN KEY (id_equipe_2) REFERENCES equipes(id)
);

-- Apostas apenas simuladas.
CREATE TABLE apostas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_partida INT NOT NULL,
    id_equipe_apostada INT NOT NULL,
    nome_apostador VARCHAR(100) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    odd DECIMAL(10,2) NOT NULL,
    resultado VARCHAR(30) DEFAULT 'Pendente',
    retorno_simulado DECIMAL(10,2) DEFAULT 0,
    FOREIGN KEY (id_partida) REFERENCES partidas(id),
    FOREIGN KEY (id_equipe_apostada) REFERENCES equipes(id)
);

INSERT INTO campeonatos
(nome, jogo, formato, limite_equipes, valor_inscricao, premio, data_inicio, status)
VALUES
('Copa Arena', 'Valorant', 'Eliminacao simples', 16, 50.00, 1500.00, '2026-10-10', 'Concluido'),
('Liga dos Campeoes', 'League of Legends', 'Pontos corridos', 8, 40.00, 1000.00, '2026-11-14', 'Aberto');

-- Quantidade informada no cadastro da equipe; jogadores abaixo sao exemplos parciais.
INSERT INTO equipes (nome, tag, jogo, quantidade_jogadores, regiao, cidade)
VALUES
('Aurora Gaming', 'AUR', 'Valorant', 5, 'Sul', 'Santa Cruz do Sul'),
('Fenix Esports', 'FNX', 'Valorant', 5, 'Sul', 'Venancio Aires'),
('Titans', 'TTN', 'League of Legends', 5, 'Sul', 'Lajeado'),
('Nexus', 'NXS', 'League of Legends', 5, 'Sul', 'Estrela');

-- Jogadores de exemplo; os elencos nao estao completos.
INSERT INTO jogadores (id_equipe, nome, nickname, idade, cidade, nivel)
VALUES
(1, 'Lucas Ferreira', 'Luks', 24, 'Santa Cruz do Sul', 'Avancado'),
(1, 'Gabriel Souza', 'Gabs', 22, 'Santa Cruz do Sul', 'Intermediario'),
(2, 'Matheus Lima', 'Math', 23, 'Venancio Aires', 'Avancado'),
(2, 'Bruno Alves', 'Brunao', 27, 'Venancio Aires', 'Profissional'),
(3, 'Andre Mendes', 'Dre', 25, 'Lajeado', 'Avancado'),
(3, 'Diego Ramos', 'Digs', 27, 'Lajeado', 'Profissional'),
(4, 'Caio Martins', 'Kaio', 24, 'Estrela', 'Avancado'),
(4, 'Gustavo Oliveira', 'Guga', 26, 'Estrela', 'Profissional');

INSERT INTO inscricoes (id_campeonato, id_equipe, data_inscricao, status)
VALUES
(1, 1, '2026-10-05', 'Confirmada'),
(1, 2, '2026-10-05', 'Confirmada'),
(2, 3, '2026-11-01', 'Confirmada'),
(2, 4, '2026-11-02', 'Confirmada');

INSERT INTO partidas
(id_campeonato, id_equipe_1, id_equipe_2, placar_equipe_1, placar_equipe_2, data_partida, rodada, status)
VALUES
(1, 1, 2, 2, 1, '2026-10-10 14:00:00', 1, 'Finalizada'),
(2, 3, 4, 0, 0, '2026-11-14 15:00:00', 1, 'Agendada');

INSERT INTO apostas
(id_partida, id_equipe_apostada, nome_apostador, valor, odd, resultado, retorno_simulado)
VALUES
(1, 1, 'Joao Silva', 10.00, 1.80, 'Ganhou', 18.00),
(1, 2, 'Marcos Santos', 5.00, 2.20, 'Perdeu', 0.00);
