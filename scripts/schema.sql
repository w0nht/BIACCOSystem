-- Forum Acadêmico - Script de criação do banco de dados
-- Execute este script no seu MySQL para criar as tabelas

CREATE DATABASE IF NOT EXISTS forum_academico CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE forum_academico;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('ADMIN', 'MODERATOR', 'STUDENT') DEFAULT 'STUDENT',
  course_id INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_course (course_id)
) ENGINE=InnoDB;

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS courses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  code VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_code (code)
) ENGINE=InnoDB;

-- Tabela de matérias (agora independente dos cursos)
CREATE TABLE IF NOT EXISTS subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  semester INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Tabela de relacionamento muitos-para-muitos entre cursos e matérias
-- Permite que uma matéria seja compartilhada entre vários cursos
CREATE TABLE IF NOT EXISTS course_subjects (
  course_id INT NOT NULL,
  subject_id INT NOT NULL,
  PRIMARY KEY (course_id, subject_id),
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de tópicos
CREATE TABLE IF NOT EXISTS topics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject_id INT NOT NULL,
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subject (subject_id),
  INDEX idx_author (author_id),
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Tabela de subtópicos
CREATE TABLE IF NOT EXISTS subtopics (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content LONGTEXT,
  topic_id INT NOT NULL,
  author_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_topic (topic_id),
  INDEX idx_author (author_id),
  FOREIGN KEY (topic_id) REFERENCES topics(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Tabela de anexos
CREATE TABLE IF NOT EXISTS attachments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  type ENUM('PDF', 'VIDEO', 'IMAGE', 'DOCUMENT', 'OTHER') DEFAULT 'OTHER',
  size INT NOT NULL,
  subtopic_id INT NOT NULL,
  uploaded_by_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subtopic (subtopic_id),
  INDEX idx_uploaded_by (uploaded_by_id),
  FOREIGN KEY (subtopic_id) REFERENCES subtopics(id) ON DELETE CASCADE,
  FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
) ENGINE=InnoDB;

-- Foreign key de users para courses (adicionada depois)
ALTER TABLE users ADD CONSTRAINT fk_user_course FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL;

-- Inserir dados iniciais

-- Cursos
INSERT INTO courses (name, description, code) VALUES
('Inteligência Artificial', 'Curso focado em machine learning, deep learning, processamento de linguagem natural e visão computacional.', 'IA'),
('Ciência da Computação', 'Curso abrangente que cobre algoritmos, estruturas de dados, sistemas operacionais, redes e engenharia de software.', 'CC');

-- Matérias exclusivas de IA
INSERT INTO subjects (name, description, semester) VALUES
('Machine Learning', 'Fundamentos de aprendizado de máquina supervisionado e não supervisionado', 3),
('Deep Learning', 'Redes neurais profundas, CNNs, RNNs e Transformers', 4),
('Processamento de Linguagem Natural', 'Técnicas de NLP, análise de sentimentos e chatbots', 5),
('Visão Computacional', 'Processamento de imagens, detecção de objetos e reconhecimento facial', 5),
('Robótica Inteligente', 'Integração de IA em sistemas robóticos', 6);

-- Matérias exclusivas de CC
INSERT INTO subjects (name, description, semester) VALUES
('Sistemas Operacionais', 'Gerenciamento de processos, memória e sistemas de arquivos', 4),
('Redes de Computadores', 'Protocolos de rede, TCP/IP e segurança de redes', 4),
('Engenharia de Software', 'Metodologias ágeis, design patterns e arquitetura de software', 5),
('Compiladores', 'Análise léxica, sintática e geração de código', 6),
('Computação Gráfica', 'Renderização 3D, shaders e animação por computador', 5);

-- Matérias COMPARTILHADAS entre IA e CC
INSERT INTO subjects (name, description, semester) VALUES
('Algoritmos e Estruturas de Dados', 'Listas, árvores, grafos, ordenação e busca', 2),
('Cálculo I', 'Limites, derivadas e integrais', 1),
('Cálculo II', 'Integrais múltiplas e séries', 2),
('Álgebra Linear', 'Matrizes, vetores e transformações lineares', 2),
('Estatística e Probabilidade', 'Distribuições, inferência estatística e testes de hipótese', 3),
('Programação Orientada a Objetos', 'Classes, herança, polimorfismo e design patterns básicos', 2),
('Banco de Dados', 'Modelagem relacional, SQL e NoSQL', 3),
('Lógica Computacional', 'Lógica proposicional, predicados e demonstrações', 1),
('Introdução à Programação', 'Conceitos básicos de programação com Python', 1);

-- Associar matérias exclusivas de IA ao curso de IA (IDs 1-5)
INSERT INTO course_subjects (course_id, subject_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5);

-- Associar matérias exclusivas de CC ao curso de CC (IDs 6-10)
INSERT INTO course_subjects (course_id, subject_id) VALUES
(2, 6), (2, 7), (2, 8), (2, 9), (2, 10);

-- Associar matérias COMPARTILHADAS a AMBOS os cursos (IDs 11-19)
INSERT INTO course_subjects (course_id, subject_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4),
(2, 1), (2, 2), (2, 3), (2, 4);

-- Criar usuário admin padrão (senha: admin123)
-- Hash bcrypt de 'admin123'
INSERT INTO users (name, email, password, role, course_id) VALUES
('Administrador', 'admin@forum.edu.br', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', NULL);
