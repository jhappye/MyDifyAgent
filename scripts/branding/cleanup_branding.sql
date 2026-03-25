BEGIN;

UPDATE apps
SET name = REPLACE(name, 'Dify', '垣码平台')
WHERE name ILIKE '%dify%';

UPDATE app_model_configs
SET config = REPLACE(config::text, 'Dify', '垣码平台')::jsonb
WHERE config::text ILIKE '%dify%';

UPDATE workflows
SET graph = REPLACE(graph::text, 'Dify', '垣码平台')::jsonb
WHERE graph::text ILIKE '%dify%';

UPDATE users
SET name = REPLACE(name, 'Dify', '垣码平台')
WHERE name ILIKE '%dify%';

UPDATE tenants
SET name = REPLACE(name, 'Dify', '垣码平台')
WHERE name ILIKE '%dify%';

COMMIT;
