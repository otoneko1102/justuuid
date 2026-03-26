CREATE TABLE IF NOT EXISTS similarity_pairs (
  uuid_a TEXT NOT NULL,
  uuid_b TEXT NOT NULL,
  score  REAL NOT NULL,
  PRIMARY KEY (uuid_a, uuid_b),
  FOREIGN KEY (uuid_a) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (uuid_b) REFERENCES users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_similarity_score ON similarity_pairs(score DESC);
