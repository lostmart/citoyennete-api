-- Insert sample themes
INSERT INTO themes (slug, title, description, color_scheme, display_order) VALUES
('principes-valeurs', '{"fr": "Principes et valeurs", "en": "Principles and Values"}', '{"fr": "Les fondements de la République", "en": "Foundations of the Republic"}', 'sky', 1),
('droits-devoirs', '{"fr": "Droits et devoirs", "en": "Rights and Duties"}', '{"fr": "Équilibre entre droits et obligations", "en": "Balance between rights and obligations"}', 'blue', 2);

-- Insert sample questions (different levels)
INSERT INTO questions (question_text, options, correct_answer_index, explanation, category, exam_level, question_type) VALUES
(
    '{"fr": "Quelle est la devise de la France?", "en": "What is the motto of France?"}',
    '{"fr": ["Travail, Famille, Patrie", "Liberté, Égalité, Fraternité", "Honneur et Patrie", "Dieu et mon Droit"], "en": ["Work, Family, Homeland", "Liberty, Equality, Fraternity", "Honor and Homeland", "God and my Right"]}',
    1,
    '{"fr": "La devise officielle depuis 1848", "en": "Official motto since 1848"}',
    'Principes et valeurs',
    'CSP',
    'knowledge'
),
(
    '{"fr": "Qui vote les lois en France?", "en": "Who votes on laws in France?"}',
    '{"fr": ["Le Président", "Le Parlement", "Le Préfet", "Le Maire"], "en": ["The President", "Parliament", "The Prefect", "The Mayor"]}',
    1,
    '{"fr": "Le Parlement (Assemblée + Sénat)", "en": "Parliament (Assembly + Senate)"}',
    'Système institutionnel',
    'CR',
    'knowledge'
),
(
    '{"fr": "Peut-on refuser de payer ses impôts pour protester?", "en": "Can you refuse to pay taxes to protest?"}',
    '{"fr": ["Oui, c''est un droit", "Non, c''est illégal", "Oui, si la majorité est d''accord", "Seulement en cas de guerre"], "en": ["Yes, it is a right", "No, it is illegal", "Yes, if the majority agrees", "Only in case of war"]}',
    1,
    '{"fr": "L''impôt est obligatoire", "en": "Tax is mandatory"}',
    'Droits et devoirs',
    'NAT',
    'situational'
);