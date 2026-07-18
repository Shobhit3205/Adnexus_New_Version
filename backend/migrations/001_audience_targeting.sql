CREATE TABLE IF NOT EXISTS audience_profiles (
    id                 SERIAL PRIMARY KEY,
    campaign_id        INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    source             VARCHAR(20) NOT NULL DEFAULT 'ai',
    industry_category  VARCHAR(255),
    business_type      VARCHAR(20),
    intent_keywords    TEXT,
    job_functions      TEXT,
    job_seniorities    TEXT,
    interests          TEXT,
    age_min            INTEGER DEFAULT 25,
    age_max            INTEGER DEFAULT 55,
    income_bracket     VARCHAR(50),
    reasoning          TEXT,
    raw_ai_output      TEXT,
    created_at         TIMESTAMP DEFAULT now(),
    updated_at         TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audience_profiles_campaign ON audience_profiles(campaign_id);

CREATE TABLE IF NOT EXISTS platform_targeting (
    id                  SERIAL PRIMARY KEY,
    audience_profile_id INTEGER NOT NULL REFERENCES audience_profiles(id) ON DELETE CASCADE,
    platform            VARCHAR(20) NOT NULL,
    targeting_spec      TEXT NOT NULL DEFAULT '{}',
    is_ai_suggested     BOOLEAN DEFAULT true,
    is_user_approved    BOOLEAN DEFAULT false,
    created_at          TIMESTAMP DEFAULT now(),
    updated_at          TIMESTAMP DEFAULT now(),
    UNIQUE (audience_profile_id, platform)
);

CREATE INDEX IF NOT EXISTS idx_platform_targeting_profile ON platform_targeting(audience_profile_id);