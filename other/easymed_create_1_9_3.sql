CREATE SCHEMA v2;
CREATE TYPE v2.biological_genders AS ENUM ('male', 'female');;

-- tables
-- Table: attachments
CREATE TABLE v2.attachments (
    attachment_id text  NOT NULL,
    cloudinary_url text  NULL,
    file_name text  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    user_id text  NOT NULL,
    CONSTRAINT attachments_pk PRIMARY KEY (attachment_id)
);

COMMENT ON COLUMN v2.attachments.user_id IS 'Who upload this image';

-- Table: blocked_devices
CREATE TABLE v2.blocked_devices (
    blocked_device_id text  NOT NULL,
    remark text  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    expiry_timestamp timestamp with time zone  NULL DEFAULT null,
    reporter_id text  NOT NULL,
    victim_id text  NOT NULL,
    CONSTRAINT blocked_devices_pk PRIMARY KEY (blocked_device_id)
);

COMMENT ON COLUMN v2.blocked_devices.expiry_timestamp IS 'if null, it will never expire; Otherwise, the device will be able to access the system again after a certain time';

-- Table: blood_types
CREATE TABLE v2.blood_types (
    blood_type_id text  NOT NULL,
    blood_type text  NOT NULL,
    CONSTRAINT blood_types_pk PRIMARY KEY (blood_type_id)
);

-- Table: clinics
CREATE TABLE v2.clinics (
    clinic_id text  NOT NULL,
    country_id text  NULL,
    is_active boolean  NOT NULL,
    english_name text  NOT NULL,
    native_name text  NULL,
    latitude real  NULL,
    longitude real  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    remark text  NULL,
    is_global boolean  NOT NULL DEFAULT false,
    default_suitcase_id text  NULL,
    CONSTRAINT clinics_pk PRIMARY KEY (clinic_id)
);

COMMENT ON COLUMN v2.clinics.is_global IS 'e.g. Office is a clinic';

-- Table: comments
CREATE TABLE v2.comments (
    comment_id text  NOT NULL,
    comment text  NOT NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    user_id text  NOT NULL,
    visit_id text  NOT NULL,
    CONSTRAINT comments_pk PRIMARY KEY (comment_id)
);

-- Table: consultation_attachments
CREATE TABLE v2.consultation_attachments (
    ca_id text  NOT NULL,
    file_id text  NOT NULL,
    consultation_id text  NOT NULL,
    CONSTRAINT consultation_attachments_pk PRIMARY KEY (ca_id)
);

COMMENT ON TABLE v2.consultation_attachments IS 'i.e. photos and other stuff
e.g. skin condition';

-- Table: consultations
CREATE TABLE v2.consultations (
    consultation_id text  NOT NULL,
    visit_id text  NOT NULL,
    user_id text  NOT NULL,
    start_timestamp timestamp with time zone  NOT NULL,
    end_timestamp timestamp with time zone  NOT NULL,
    ros_ga text  NULL,
    ros_respi text  NULL,
    ros_cardio text  NULL,
    ros_gastro text  NULL,
    ros_genital text  NULL,
    ros_ent text  NULL,
    ros_skin text  NULL,
    ros_other text  NULL,
    preg_lmp date  NULL,
    preg_curr_preg smallint  NULL,
    preg_gestration smallint  NULL,
    preg_breast_feeding boolean  NULL,
    preg_contraceptive boolean  NULL,
    preg_num_preg smallint  NULL,
    preg_num_live_birth smallint  NULL,
    preg_num_miscarriage smallint  NULL,
    preg_num_abortion smallint  NULL,
    preg_num_still_birth smallint  NULL,
    preg_remark text  NULL,
    pe_general text  NULL,
    pe_respiratory text  NULL,
    pe_cardio text  NULL,
    pe_gastro text  NULL,
    pe_genital text  NULL,
    pe_ent text  NULL,
    pe_skin text  NULL,
    pe_other text  NULL,
    rf_alertness text  NULL,
    rf_breathing text  NULL,
    rf_circulation text  NULL,
    rf_dehydration text  NULL,
    rf_defg text  NULL,
    diagnosis text  NULL,
    advice text  NULL,
    follow_up text  NULL,
    education text  NULL,
    remark text  NULL,
    CONSTRAINT consultations_pk PRIMARY KEY (consultation_id)
);

COMMENT ON COLUMN v2.consultations.preg_curr_preg IS 'no >> 0, 1 baby >> 1, twins >> 2';
COMMENT ON COLUMN v2.consultations.preg_gestration IS 'i.e. how many weeks';

-- Table: countries
CREATE TABLE v2.countries (
    country_id text  NOT NULL,
    english_name text  NOT NULL,
    native_name text  NULL,
    phone_country_code smallint  NULL,
    phone_number_syntax text  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    emoji text NULL,
    CONSTRAINT countries_pk PRIMARY KEY (country_id)
);

-- Table: document_types
CREATE TABLE v2.document_types (
    document_type_id text  NOT NULL,
    type text  NOT NULL,
    CONSTRAINT document_types_pk PRIMARY KEY (document_type_id)
);

-- Table: documents
CREATE TABLE v2.documents (
    document_id text  NOT NULL,
    document_type text  NOT NULL,
    patient_id text  NOT NULL,
    document text  NOT NULL,
    CONSTRAINT documents_pk PRIMARY KEY (document_id)
);

COMMENT ON TABLE v2.documents IS 'hpi, family history & social history (can add more in the future)';

-- Table: emergency_contacts
CREATE TABLE v2.emergency_contacts (
    emergency_contact_id text  NOT NULL,
    user_id text  NOT NULL,
    name text  NOT NULL,
    phone_number_1 text  NULL,
    phone_number_2 text  NULL,
    phone_number_3 text  NULL,
    email text  NULL,
    relationship_description text  NULL,
    remark text  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    CONSTRAINT emergency_contacts_pk PRIMARY KEY (emergency_contact_id)
);

-- Table: genders
CREATE TABLE v2.genders (
    gender_id text  NOT NULL,
    description text  NOT NULL,
    biological_gender v2.biological_genders  NOT NULL,
    CONSTRAINT genders_pk PRIMARY KEY (gender_id)
);

-- Table: investigation_attachment
CREATE TABLE v2.investigation_attachment (
    ia_id text  NOT NULL,
    file_id text  NOT NULL,
    investigation_id text  NOT NULL,
    remark text  NULL,
    CONSTRAINT investigation_attachment_pk PRIMARY KEY (ia_id)
);

COMMENT ON COLUMN v2.investigation_attachment.remark IS 'e.g. Figure 1: picture of X-Ray (1)';

-- Table: investigations
CREATE TABLE v2.investigations (
    investigation_id text  NOT NULL,
    consultation_id text  NOT NULL,
    investigation text  NOT NULL,
    remark text  NULL,
    response text  NULL,
    CONSTRAINT investigations_pk PRIMARY KEY (investigation_id)
);

-- Table: keywords
CREATE TABLE v2.keywords (
    keyword_id text  NOT NULL,
    keyword text  NOT NULL DEFAULT false,
    chief_complaint boolean  NOT NULL DEFAULT false,
    diagnosis boolean  NOT NULL DEFAULT false,
    screening boolean  NOT NULL DEFAULT false,
    allergen boolean  NOT NULL DEFAULT false,
    follow_up boolean  NOT NULL DEFAULT false,
    advice boolean  NOT NULL DEFAULT false,
    education boolean  NOT NULL DEFAULT false,
    general boolean  NOT NULL DEFAULT false,
    medication_route boolean  NOT NULL DEFAULT false,
    medication_form boolean  NOT NULL DEFAULT false,
    unit boolean  NOT NULL DEFAULT false,
    investigation boolean  NOT NULL DEFAULT false,
    medication_frequency boolean  NOT NULL DEFAULT false,
    relationship_type boolean  NOT NULL DEFAULT false,
    marital_status boolean  NOT NULL DEFAULT false,
    CONSTRAINT keywords_pk PRIMARY KEY (keyword_id)
);

COMMENT ON TABLE v2.keywords IS 'Words that will be used for auto-complete. ';

-- Table: medication_variants
CREATE TABLE v2.medication_variants (
    medication_variant_id text  NOT NULL,
    medication_id text  NOT NULL,
    strength text  NOT NULL,
    form text  NOT NULL,
    stock smallint  NOT NULL DEFAULT 0,
    user_id text  NOT NULL,
    suitcase_id text  NOT NULL,
    name text  NOT NULL,
    remark text  NULL,
    CONSTRAINT medication_variants_pk PRIMARY KEY (medication_variant_id)
);

COMMENT ON COLUMN v2.medication_variants.stock IS '0 >> no
1 >> very little
2 >> (more than) enough';
COMMENT ON COLUMN v2.medication_variants.name IS 'I should''''ve called it brand but i am too lazy to change it back';

-- Table: medications
CREATE TABLE v2.medications (
    medication_id text  NOT NULL,
    medication text  NOT NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    user_id text  NOT NULL,
    CONSTRAINT medications_pk PRIMARY KEY (medication_id)
);

-- Table: notifications
CREATE TABLE v2.notifications (
    notification_id text  NOT NULL,
    message text  NOT NULL,
    read boolean  NOT NULL DEFAULT false,
    user_id text  NOT NULL,
    remind_date date  NOT NULL,
    CONSTRAINT notifications_pk PRIMARY KEY (notification_id)
);

-- Table: patients
CREATE TABLE v2.patients (
    patient_id text  NOT NULL,
    honorific text  NULL,
    first_name text  NOT NULL,
    middle_name text  NULL,
    last_name text  NULL,
    address text  NULL,
    email text  NULL,
    birth_year smallint  NULL,
    birth_month smallint  NULL,
    birth_date smallint  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    clinic_id text  NOT NULL,
    gender_id text  NULL,
    image_id text  NULL,
    blood_type_id text  NULL,
    phone_number_country_code text  NULL,
    phone_number text  NULL,
    native_name int  NULL,
    CONSTRAINT patients_pk PRIMARY KEY (patient_id)
);

-- Table: pharmacies
CREATE TABLE v2.pharmacies (
    pharmacy_id text  NOT NULL,
    visits_visit_id text  NOT NULL,
    user_id text  NOT NULL,
    start_timestamp timestamp with time zone  NOT NULL DEFAULT now(),
    end_timestamp timestamp with time zone  NOT NULL DEFAULT now(),
    CONSTRAINT pharmacies_pk PRIMARY KEY (pharmacy_id)
);

-- Table: prescriptions
CREATE TABLE v2.prescriptions (
    prescription_id text  NOT NULL,
    consultation_id text  NOT NULL,
    medication_id text  NOT NULL,
    prescription_detail text  NOT NULL,
    prescribed boolean  NOT NULL DEFAULT false,
    CONSTRAINT prescriptions_pk PRIMARY KEY (prescription_id)
);

-- Table: queries
CREATE TABLE v2.queries (
    query_id text  NOT NULL,
    query text  NOT NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    user_id text  NOT NULL,
    CONSTRAINT queries_pk PRIMARY KEY (query_id)
);

COMMENT ON TABLE v2.queries IS 'SQL queries for syncronization';

-- Table: related_data
CREATE TABLE v2.related_data (
    rd_id text  NOT NULL,
    data text  NOT NULL,
    remark text  NULL,
    consultation_id text  NOT NULL,
    category smallint  NOT NULL,
    CONSTRAINT related_data_pk PRIMARY KEY (rd_id)
);

COMMENT ON TABLE v2.related_data IS 'i.e. everything with 1) a data and 2) a remark and 3) 1:N';
COMMENT ON COLUMN v2.related_data.category IS '0>>screening
1>>advice
2>>follow-up
3>>education
4>>previous medical history
5>>diagnosis';

-- Table: relationships
CREATE TABLE v2.relationships (
    relationship_id text  NOT NULL,
    patient_id_1 text  NOT NULL,
    patient_id_2 text  NOT NULL,
    remark text  NULL,
    CONSTRAINT relationships_pk PRIMARY KEY (relationship_id)
);

-- Table: roles
CREATE TABLE v2.roles (
    role_id text  NOT NULL,
    name text  NOT NULL,
    attachments_read boolean  NOT NULL DEFAULT false,
    attachments_write boolean  NOT NULL DEFAULT false,
    blocked_devices_read boolean  NOT NULL DEFAULT false,
    blocked_devices_write boolean  NOT NULL DEFAULT false,
    blood_types_read boolean  NOT NULL DEFAULT false,
    blood_types_write boolean  NOT NULL DEFAULT false,
    clinics_read boolean  NOT NULL DEFAULT false,
    clinics_write boolean  NOT NULL DEFAULT false,
    comments_read boolean  NOT NULL DEFAULT false,
    comments_write boolean  NOT NULL DEFAULT false,
    consultation_attachments_write boolean  NOT NULL DEFAULT false,
    consultation_attachments_read boolean  NOT NULL DEFAULT false,
    consultations_read boolean  NOT NULL DEFAULT false,
    consultations_write boolean  NOT NULL DEFAULT false,
    document_types_read boolean  NOT NULL DEFAULT false,
    document_types_write boolean  NOT NULL DEFAULT false,
    emergency_contacts_read boolean  NOT NULL DEFAULT false,
    emergency_contacts_write boolean  NOT NULL DEFAULT false,
    genders_read boolean  NOT NULL DEFAULT false,
    genders_write boolean  NOT NULL DEFAULT false,
    investigation_attachments_read boolean  NOT NULL DEFAULT false,
    investigation_attachments_write boolean  NOT NULL DEFAULT false,
    investigation_read boolean  NOT NULL DEFAULT false,
    investigation_write boolean  NOT NULL DEFAULT false,
    keywords_read boolean  NOT NULL DEFAULT false,
    keywords_write boolean  NOT NULL DEFAULT false,
    medication_variants_read boolean  NOT NULL DEFAULT false,
    medication_variants_write boolean  NOT NULL DEFAULT false,
    medications_read boolean  NOT NULL DEFAULT false,
    medications_write boolean  NOT NULL DEFAULT false,
    notifications_read boolean  NOT NULL DEFAULT false,
    notifications_write boolean  NOT NULL DEFAULT false,
    patients_read boolean  NOT NULL DEFAULT false,
    patients_write boolean  NOT NULL DEFAULT false,
    pharmacies_read boolean  NOT NULL DEFAULT false,
    pharmacies_write boolean  NOT NULL DEFAULT false,
    prescriptions_read boolean  NOT NULL DEFAULT false,
    prescriptions_write boolean  NOT NULL DEFAULT false,
    related_data_read boolean  NOT NULL DEFAULT false,
    related_data_write boolean  NOT NULL DEFAULT false,
    relationship_types_read boolean  NOT NULL DEFAULT false,
    relationship_types_write boolean  NOT NULL DEFAULT false,
    roles_read boolean  NOT NULL DEFAULT false,
    roles_write boolean  NOT NULL DEFAULT false,
    suitcase_read boolean  NOT NULL DEFAULT false,
    suitcase_write boolean  NOT NULL DEFAULT false,
    tokens_read boolean  NOT NULL DEFAULT false,
    tokens_write boolean  NOT NULL DEFAULT false,
    triages_read boolean  NOT NULL DEFAULT false,
    triages_write boolean  NOT NULL DEFAULT false,
    users_read boolean  NOT NULL DEFAULT false,
    users_write boolean  NOT NULL DEFAULT false,
    visits_read boolean  NOT NULL DEFAULT false,
    visits_write boolean  NOT NULL DEFAULT false,
    relationships_read boolean  NOT NULL DEFAULT false,
    relationships_write boolean  NOT NULL DEFAULT false,
    CONSTRAINT roles_pk PRIMARY KEY (role_id)
);

-- Table: suitcases
CREATE TABLE v2.suitcases (
    suitcase_id text  NOT NULL,
    suitcase_name text  NOT NULL,
    CONSTRAINT suitcases_pk PRIMARY KEY (suitcase_id)
);

-- Table: tokens
CREATE TABLE v2.tokens (
    token text  NOT NULL,
    expiry_timestamp timestamp with time zone  NOT NULL,
    device_id text  NOT NULL,
    is_access_token boolean  NOT NULL,
    user_id text  NOT NULL,
    CONSTRAINT tokens_pk PRIMARY KEY (token)
);

-- Table: triages
CREATE TABLE v2.triages (
    triage_id text  NOT NULL,
    visit_id text  NOT NULL,
    user_id text  NOT NULL,
    systolic smallint  NULL,
    diastolic smallint  NULL,
    heart_rate smallint  NULL,
    respiratory_rate smallint  NULL,
    weight smallint  NULL,
    height smallint  NULL,
    temperature smallint  NULL,
    spo2 smallint  NULL,
    head_circumference real NULL,
    last_deworming_tablet date  NULL,
    chief_complains text  NULL,
    remark text  NULL,
    start_timestamp timestamp with time zone  NOT NULL,
    end_timestamp timestamp with time zone  NOT NULL,
    edited_in_consultation boolean  NOT NULL DEFAULT false,
    CONSTRAINT triages_pk PRIMARY KEY (triage_id)
);

COMMENT ON COLUMN v2.triages.weight IS 'e.g. 72.7kg >> "727"';
COMMENT ON COLUMN v2.triages.height IS 'e.g. 171.4cm >> "1714"';
COMMENT ON COLUMN v2.triages.temperature IS '1. Always in Celsius
2. e.g. 37.2 >> "372"';
COMMENT ON COLUMN v2.triages.chief_complains IS 'Basically a giant box';

-- Table: users
CREATE TABLE v2.users (
    user_id text  NOT NULL,
    gender_id text  NULL,
    role_id text  NOT NULL,
    honorific text  NULL,
    first_name text  NOT NULL,
    middle_name text  NULL,
    last_name text  NULL,
    nickname text  NULL,
    username text  NOT NULL,
    email text  NULL,
    salt text  NOT NULL,
    processed_password text  NOT NULL,
    birth_year smallint  NULL,
    birth_month smallint  NULL,
    birth_day smallint  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    image_id text  NULL,
    phone_number text  NULL,
    phone_country_code text  NULL,
    CONSTRAINT users_ak_1 UNIQUE (nickname) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT users_pk PRIMARY KEY (user_id)
);

-- Table: visits
CREATE TABLE v2.visits (
    visit_id text  NOT NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    tag smallint  NOT NULL,
    next_station smallint  NULL,
    patient_id text  NOT NULL,
    CONSTRAINT visits_pk PRIMARY KEY (visit_id)
);

COMMENT ON COLUMN v2.visits.next_station IS '0 >> triage
1 >> consultation
2 >> pharmacy
3 >> finished';

-- foreign keys
-- Reference: attachment_consultation (table: consultation_attachments)
ALTER TABLE v2.consultation_attachments ADD CONSTRAINT attachment_consultation 
    FOREIGN KEY (consultation_id)
    REFERENCES v2.consultations (consultation_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: attachment_files (table: consultation_attachments)
ALTER TABLE v2.consultation_attachments ADD CONSTRAINT attachment_files 
    FOREIGN KEY (file_id)
    REFERENCES v2.attachments (attachment_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: blocked_devices_reporter (table: blocked_devices)
ALTER TABLE v2.blocked_devices ADD CONSTRAINT blocked_devices_reporter 
    FOREIGN KEY (reporter_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: blocked_devices_victim (table: blocked_devices)
ALTER TABLE v2.blocked_devices ADD CONSTRAINT blocked_devices_victim 
    FOREIGN KEY (victim_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: clinics_suitcases (table: clinics)
ALTER TABLE v2.clinics ADD CONSTRAINT clinics_suitcases 
    FOREIGN KEY (default_suitcase_id)
    REFERENCES v2.suitcases (suitcase_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: comments_users (table: comments)
ALTER TABLE v2.comments ADD CONSTRAINT comments_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: comments_visits (table: comments)
ALTER TABLE v2.comments ADD CONSTRAINT comments_visits 
    FOREIGN KEY (visit_id)
    REFERENCES v2.visits (visit_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: consultation_users (table: consultations)
ALTER TABLE v2.consultations ADD CONSTRAINT consultation_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: consultation_visits (table: consultations)
ALTER TABLE v2.consultations ADD CONSTRAINT consultation_visits 
    FOREIGN KEY (visit_id)
    REFERENCES v2.visits (visit_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: documents_document_types (table: documents)
ALTER TABLE v2.documents ADD CONSTRAINT documents_document_types 
    FOREIGN KEY (document_type)
    REFERENCES v2.document_types (document_type_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: documents_patients (table: documents)
ALTER TABLE v2.documents ADD CONSTRAINT documents_patients 
    FOREIGN KEY (patient_id)
    REFERENCES v2.patients (patient_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: emergency_contacts_users (table: emergency_contacts)
ALTER TABLE v2.emergency_contacts ADD CONSTRAINT emergency_contacts_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: images_users (table: attachments)
ALTER TABLE v2.attachments ADD CONSTRAINT images_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: investigation_attachment_files (table: investigation_attachment)
ALTER TABLE v2.investigation_attachment ADD CONSTRAINT investigation_attachment_files 
    FOREIGN KEY (file_id)
    REFERENCES v2.attachments (attachment_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: investigation_attachment_investigations (table: investigation_attachment)
ALTER TABLE v2.investigation_attachment ADD CONSTRAINT investigation_attachment_investigations 
    FOREIGN KEY (investigation_id)
    REFERENCES v2.investigations (investigation_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: investigations_consultation (table: investigations)
ALTER TABLE v2.investigations ADD CONSTRAINT investigations_consultation 
    FOREIGN KEY (consultation_id)
    REFERENCES v2.consultations (consultation_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: medication_users (table: medications)
ALTER TABLE v2.medications ADD CONSTRAINT medication_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: medication_variant_medication (table: medication_variants)
ALTER TABLE v2.medication_variants ADD CONSTRAINT medication_variant_medication 
    FOREIGN KEY (medication_id)
    REFERENCES v2.medications (medication_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: medication_variant_suitcases (table: medication_variants)
ALTER TABLE v2.medication_variants ADD CONSTRAINT medication_variant_suitcases 
    FOREIGN KEY (suitcase_id)
    REFERENCES v2.suitcases (suitcase_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: medication_variant_users (table: medication_variants)
ALTER TABLE v2.medication_variants ADD CONSTRAINT medication_variant_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: notifications_users (table: notifications)
ALTER TABLE v2.notifications ADD CONSTRAINT notifications_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: patients_blood_types (table: patients)
ALTER TABLE v2.patients ADD CONSTRAINT patients_blood_types 
    FOREIGN KEY (blood_type_id)
    REFERENCES v2.blood_types (blood_type_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: patients_countries (table: patients)
ALTER TABLE v2.patients ADD CONSTRAINT patients_countries 
    FOREIGN KEY (phone_number_country_code)
    REFERENCES v2.countries (country_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: patients_genders (table: patients)
ALTER TABLE v2.patients ADD CONSTRAINT patients_genders 
    FOREIGN KEY (gender_id)
    REFERENCES v2.genders (gender_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: patients_images (table: patients)
ALTER TABLE v2.patients ADD CONSTRAINT patients_images 
    FOREIGN KEY (image_id)
    REFERENCES v2.attachments (attachment_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: patients_slums (table: patients)
ALTER TABLE v2.patients ADD CONSTRAINT patients_slums 
    FOREIGN KEY (clinic_id)
    REFERENCES v2.clinics (clinic_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: pharmacies_users (table: pharmacies)
ALTER TABLE v2.pharmacies ADD CONSTRAINT pharmacies_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: pharmacies_visits (table: pharmacies)
ALTER TABLE v2.pharmacies ADD CONSTRAINT pharmacies_visits 
    FOREIGN KEY (visits_visit_id)
    REFERENCES v2.visits (visit_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: prescriptions_consultation (table: prescriptions)
ALTER TABLE v2.prescriptions ADD CONSTRAINT prescriptions_consultation 
    FOREIGN KEY (consultation_id)
    REFERENCES v2.consultations (consultation_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: prescriptions_medication (table: prescriptions)
ALTER TABLE v2.prescriptions ADD CONSTRAINT prescriptions_medication 
    FOREIGN KEY (medication_id)
    REFERENCES v2.medications (medication_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: queries_users (table: queries)
ALTER TABLE v2.queries ADD CONSTRAINT queries_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: relationships_patients_1 (table: relationships)
ALTER TABLE v2.relationships ADD CONSTRAINT relationships_patients_1 
    FOREIGN KEY (patient_id_1)
    REFERENCES v2.patients (patient_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: relationships_patients_2 (table: relationships)
ALTER TABLE v2.relationships ADD CONSTRAINT relationships_patients_2 
    FOREIGN KEY (patient_id_2)
    REFERENCES v2.patients (patient_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: slums_countries (table: clinics)
ALTER TABLE v2.clinics ADD CONSTRAINT slums_countries 
    FOREIGN KEY (country_id)
    REFERENCES v2.countries (country_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: stuff_and_remark_consultation (table: related_data)
ALTER TABLE v2.related_data ADD CONSTRAINT stuff_and_remark_consultation 
    FOREIGN KEY (consultation_id)
    REFERENCES v2.consultations (consultation_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: tokens_users (table: tokens)
ALTER TABLE v2.tokens ADD CONSTRAINT tokens_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: triages_users (table: triages)
ALTER TABLE v2.triages ADD CONSTRAINT triages_users 
    FOREIGN KEY (user_id)
    REFERENCES v2.users (user_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: triages_visits (table: triages)
ALTER TABLE v2.triages ADD CONSTRAINT triages_visits 
    FOREIGN KEY (visit_id)
    REFERENCES v2.visits (visit_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_countries (table: users)
ALTER TABLE v2.users ADD CONSTRAINT users_countries 
    FOREIGN KEY (phone_country_code)
    REFERENCES v2.countries (country_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_files (table: users)
ALTER TABLE v2.users ADD CONSTRAINT users_files 
    FOREIGN KEY (image_id)
    REFERENCES v2.attachments (attachment_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_genders (table: users)
ALTER TABLE v2.users ADD CONSTRAINT users_genders 
    FOREIGN KEY (gender_id)
    REFERENCES v2.genders (gender_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: users_roles (table: users)
ALTER TABLE v2.users ADD CONSTRAINT users_roles 
    FOREIGN KEY (role_id)
    REFERENCES v2.roles (role_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- Reference: visits_patients (table: visits)
ALTER TABLE v2.visits ADD CONSTRAINT visits_patients 
    FOREIGN KEY (patient_id)
    REFERENCES v2.patients (patient_id)  
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE
;

-- countries
INSERT INTO v2.countries (country_id, english_name, native_name, phone_country_code, phone_number_syntax, create_timestamp) VALUES
('uVrV2ypMrMCx1bU9', 'Singapore', 'Singapore', 65,'^\d{8}\b', now()),
('MHgJ4UAuzKQ6qeFq', 'Cambodia', 'កម្ពុជា', 855,'', now()),
('zwhQ211hktYEMBgq', 'Timor Leste', 'Timór Lorosa\'e', 670,'', now()),
('7UPJ6d9gbf1N4j94', 'Hong Kong', '香港', 852,'^\d{8}\b', now()),
('NcJusq78xGHh18HA', 'Australia', 'Australia', 61,'', now());


-- blood_types
INSERT INTO v2.blood_types (blood_type_id, blood_type) VALUES ('y4fJB3khxq9yPt9v', 'A+');
('DR9HX1n68Xx4uNrU', 'A-'),
('6ck1cypE9qXEBV4T', 'B+'),
('jKYf4bN6rjWwzwyt', 'B-'),
('y7uPbrFW9AEfmEfk', 'O+'),
('RrGFjPYrJvxC4MZ6', 'O-'),
('A2chWeVAn8erppfP', 'AB+'),
('9utJN2ewPF7M2QM9', 'AB-');

-- genders
INSERT INTO v2.genders (gender_id, description, biological_gender) VALUES
('NztY6nwNA7FH2Z16', 'Male', 'male'),
('JPRPQzp1PhUnQu3X', 'Female', 'female');

-- document_types
INSERT INTO "document_types"("document_type_id","type") VALUES
('sRVN5NazMKG4FMnk','hpi'),
('tR7fDN9Nxf86dR5d','fh'),
('D6g6ZDNxNEhCGNpf','sh'),
('MUwn1Duv1sgsEVga','pmh');

-- keywords TODO double check
INSERT INTO v2.keywords (keyword_id, keyword, allergen) VALUES
('Q4eq6V6qGn1JbjtP', 'dust', true),
('rKqMex41zuN4Skf2', 'pollen', true),
('Ne6TpkCQVQaPNrfq', 'peanut', true),
('fGJfrPR4b3X9D22u', 'egg', true),
('St5wWNqSbD36DraP', 'dog', true),
('ETz6TseTZcABxTu3', 'cat', true),
('YwhB6mR3GNaY2dyt', 'sea food', true),
('42DY5TnW5ySwQjkc', 'meat', true);

INSERT INTO v2.keywords (keyword_id, keyword, chief_complain) VALUES
('PQWNByXTFB28vkUD', 'Cough', true),
('8aaJmtEYr42jqQ6v', 'Headache', true),
('TY6P741VvtqQ3UMT', 'Lower back pain', true),
('zd1BNcGcG7vgZGPW', 'Knee pain', true),
('V7MdMyfCUR75NfM8', 'Chest pain', true),
('tVt18UfepUJtNe23', 'Abdominal pain', true),
('BhnZRFU7YKgepRRJ', 'Diarrhoea', true),
('14uRXj9rCTgW1sjG', 'Vomiting', true),
('KFcygVe3Fgqxzm65', 'Conspitation', true),
('6dggN7WQ2DbJVGsH', 'Dizzy', true),
('S5YyXsp4RuCK7w6c', 'Palpitation', true),
('2v5VC9sE8EKJ6JFg', 'Tiredness', true),
('2C9fgjJ5D4UWXtWa', 'Stiff neck', true),
('nb7zRyftypCnrqt7', 'Vaginal discharge', true),
('ZGW6mgZKDntqeedM', 'Eye pain', true),
('9zS4pBZ1D2Bf4DGp', 'Ear pain', true),
('zmRRny8ysyRtMMZx', 'Leg / arm numbness (right / left)', true),
('uRyT7w1ATFR6cQkC', 'Sore throat', true),
('5C7kYvEVnQcd7K3K', 'Runny nose', true),
('SnsrTT2HWdUffApW', 'Itchy (whole body)', true),
('YzD6rzJXYPKhFKEE', 'Itchy (specific location)', true),
('BM8u9wKRf92rTpZC', 'Elbow pain', true),
('UEQGjJBbv8paZW8v', 'Mouth pain', true),
('gJsDd3fSC9bsA6JV', 'Mouth ulcer', true),
('aNypN2dgJCg8y3PZ', 'Infected wound', true),
('3v45GWkQASeZxm3h', 'Nose bleeding', true),
('MK5Ve3W5CDer8JG1', 'Nose block', true),
('7v3kDWkzDj4AdUKj', 'Vaginal itchiness', true),
('Pnve8mU76T5xv5pn', 'Itchy skin', true),
('dfKGGn2v7f1pCDYX', 'Itchy rash', true),
('tbHm5UxFe4BuwR7x', 'Epigastralgia', true),
('2QECmesE2DMte7ea', 'Ankle pain', true),
('JvnCFafB3n4n2nTU', 'Wrist pain', true),
('T7wnTrNuYbKbPN1C', 'Insomnia', true),
('PfakA6wTZsyGpBr3', 'Dysphagia', true),
('kY4bbf5kxq57HHUb', 'Polyuria', true),
('XXH6dwGn8WNFdDmV', 'nocturnal polyuria ', true),
('nd1a5EACRkn21hBd', 'Watery stool', true),
('4q5R4pgYEByu7xdB', 'Gum bleeding', true),
('k6TRJ6z6x6SmgN1y', 'Sleep disturbance', true),
('G9gNZwn3yhEyup3g', 'Diabetes- type 1 or 2 ', true),
('x3q3VuKMSPh69AVq', 'Tummy pain', true),
('7dGfpgGnAYygdfx8', 'Weight loss', true),
('d33bMCvs91KmVP9R', 'Appetite loss', true);

INSERT INTO v2.keywords (keyword_id, keyword, diagnosis) VALUES
('R49KMvmQBjjMtpcU', 'URTI', true),
('S41A5C8cPr8k2s3V', 'pyelonephritis', true),
('bjy8P9ABWVmDkb6T', 'arthritis', true),
('VSREx4D2rXuw9mfu', 'UTI', true),
('aufSTnMf2gtBvEWm', 'cystitis', true),
('xgAzmuVP3rKfmsKe', 'conjunctivitis ', true),
('rRB7rGESZhWG9b8H', 'tension headache ', true),
('jkmUYZf9cSS2xW5x', 'migrain headache', true),
('T5JwGpPNDRAqeYV6', 'encephalitis', true),
('72SqDpuau2pGadNm', 'meningitis', true),
('QFmHajtAN6kY63P9', 'cataract', true),
('Q9c8RaJGxd9Fv6Ya', 'pterygium', true),
('jDrSSvXdqhtN1vaZ', 'glaucoma', true),
('n1kCwcw7TuryJkE3', 'otitis media', true),
('YQsxC6qqvqUd7bwc', 'allergic rhinitis', true),
('TvBqs5mxPZRsedwm', 'rhino-pharynxgitis', true),
('yAvBevs4e7yC7B3A', 'sinusitis', true),
('G7ftEVK3trNp6HPN', 'rhino-sinusitis', true),
('WcM73MvBZzsv7R7x', 'larynxgitis', true),
('fVKJ3qFGqNDxpze9', 'tonsilitis', true),
('hTbgNRkRdrmcMCn4', 'bronchitis', true),
('8SnQhSe6tsgkvuU9', 'bronchiolitis', true),
('uTYh8hZR7Gpza8X4', 'bronchopneumonia', true),
('9bmxTYKhRzBGWS9E', 'pneumonia', true),
('8Jtf5Ef3G1zr4rPp', 'tuberculosis', true),
('nd1gU33XWjX925eS', 'lung abcess', true),
('RJqq4PefMvf5e1n2', 'asthma', true),
('Ddfz6UJCzat135AC', 'COPD', true),
('uPYpNpsjP3V573bk', 'lung cancer', true),
('4xZpynbmzCY5zzse', 'pneumothorax', true),
('1dae7S9sFVXn36X8', 'pleuritis', true),
('x6u2FUBQZUEqg9Yc', 'lung trauma', true),
('QjQxVM6YPsj7vK1Y', 'emphysema', true),
('sb6P6Bgbq598XKev', 'atelectasis', true),
('S16y6WY76nY1qKSm', 'heart failure', true),
('5NVWQkeEAPdY9Bkd', 'hypertension', true),
('e7Bb5YJgWEcXAvVt', 'diabetes', true),
('qnNKvfPJeF5dQgbY', 'gastritis', true),
('guQpnh5AqzgywUVY', 'gastroneteritis', true),
('Jne3DuQUv22MRmKQ', 'IBD', true),
('mQzu1MEexv3KFKeT', 'colonitis', true),
('KdkfZtg6WzgvUwBp', 'appendicitis', true),
('vnwrvA1fKS3NrFpx', 'hemorrhoid', true),
('UHVG8YaPy1EKaEjw', 'oesteoarthritis', true),
('v7sqN1gP8KZRJhVw', 'rheumatoid arthritis', true),
('c4JJzd6dmhasWK5R', 'gout', true),
('bC3h1qKMjVAXAHMm', 'GORD', true),
('aWMpy7WGn6yB658K', 'sciatica', true),
('Gbjs8Xg7zkZ5dgJt', 'stroke', true),
('6PSADWf6G5kXeqss', 'external otitis', true),
('GFYnxmadP4qXhbfT', 'nose polype', true),
('snYB33gtAR1npzbR', 'common cold', true),
('Yv68ZaXmZXsd2GSh', 'red eyes', true),
('4EdhZHpkUxd2Pjtj', 'breast tumour', true),
('enTjSGCBANe6Rwpv', 'vaginitis', true),
('3ZVQSGFPNCv7Uyet', 'abdomen mass', true),
('Mr21bcP1uKQG1pFr', 'herpes simplex', true),
('sbkRrErNqc62xk6D', 'herpes zoster', true),
('843ZFzA1DCtTpd3g', 'anemia', true),
('cUGJM37F3zy46JNZ', 'enuresis', true),
('HQTfQ7e8hCsCxsfq', 'infertility', true),
('UghC4BGtRBh7Nn7A', 'menopause', true),
('Hs7T1tExvesG179h', 'menorrhagia', true),
('Xseuf9z8TWf8R5Zt', 'abscess', true),
('awTT4sE9b552XBra', 'acne vulgaris', true),
('qBNdwtAAhs741M8T', 'acne ropgaris', true);

-- roles: admin, TODO doctor, nurse
INSERT INTO v2.roles (role_id, name, attachments_read, attachments_write, blocked_devices_read, blocked_devices_write, blood_types_read, blood_types_write, clinics_read, clinics_write, comments_read, comments_write, consultation_attachments_read, consultation_attachments_write, consultations_read, consultations_write, countries_read, countries_write, document_types_read, document_types_write, documents_read, documents_write, emergency_contacts_read, emergency_contacts_write, genders_read, genders_write, investigation_attachments_read, investigation_attachments_write, investigations_read, investigations_write, keywords_read, keywords_write, medication_variants_read, medication_variants_write, medications_read, medications_write, notifications_read, notifications_write, patients_read, patients_write, pharmacies_read, pharmacies_write, prescriptions_read, prescriptions_write, related_data_read, related_data_write, relationship_types_read, relationship_types_write, roles_read, roles_write, suitcases_read, suitcases_write, tokens_read, tokens_write, triages_read, triages_write, users_read, users_write, visits_read, visits_write, relationships_read, relationships_write, queries_read, queries_write) VALUES
('ncZ5EnnNtD9p4f7F','Admin',TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE,TRUE);

-- TODO users: admin
INSERT INTO v2.users (user_id, role_id, first_name, username, salt, processed_password, create_timestamp) VALUES
('5pFGdEw1hR3uSCgQ', 'ncZ5EnnNtD9p4f7F', 'Admin', 'admin', '', '', now());

-- medications
INSERT INTO v2.medications (medication_id, create_timestamp, user_id, medication) VALUES
('gQ9ypgF7JxGJYmM2', now(), '5pFGdEw1hR3uSCgQ', 'Paracetamol'),
('TyJD2gj6gtenvU1t', now(), '5pFGdEw1hR3uSCgQ', 'Ibuprofen'),
('6TERHseFZ6FBWtS4', now(), '5pFGdEw1hR3uSCgQ', 'Diazepam'),
('6bwpzVrBdFuC59n4', now(), '5pFGdEw1hR3uSCgQ', 'Penicilline'),
('ennae9FN2UjBa9v7', now(), '5pFGdEw1hR3uSCgQ', 'Amoxicilline'),
('EXaREUv8dzjmQ47M', now(), '5pFGdEw1hR3uSCgQ', 'Amlodipine'),
('9s1x7MvUAHgwGW54', now(), '5pFGdEw1hR3uSCgQ', 'Ciprofloxacine'),
('tdXw8ZFWPqMe2FYz', now(), '5pFGdEw1hR3uSCgQ', 'Omeprazole'),
('nGXEpwpWKmWWjm1B', now(), '5pFGdEw1hR3uSCgQ', 'Cimetidine'),
('4tSDj5mfAMGkY8Bp', now(), '5pFGdEw1hR3uSCgQ', 'Laxative'),
('bye4WepqGgWqWPzS', now(), '5pFGdEw1hR3uSCgQ', 'Lisinopril'),
('xVuPQF2xxHjxvFPS', now(), '5pFGdEw1hR3uSCgQ', 'Propranolol'),
('Mmmh4dWWDp6ReCBX', now(), '5pFGdEw1hR3uSCgQ', 'Metformine'),
('rKqmYUjuKdnf3J8X', now(), '5pFGdEw1hR3uSCgQ', 'Erythromycine'),
('MqP8drcBAWCCNpH5', now(), '5pFGdEw1hR3uSCgQ', 'Doxycycline'),
('r9xyxSCgc8wYp3g8', now(), '5pFGdEw1hR3uSCgQ', 'Tramadol'),
('rMTWWjq6c7nsqD1P', now(), '5pFGdEw1hR3uSCgQ', 'Chlorpheniramin'),
('jETsYUY9CM1BGbWH', now(), '5pFGdEw1hR3uSCgQ', 'Certirizine'),
('K4SXdkMDmv74Z2JK', now(), '5pFGdEw1hR3uSCgQ', 'Metronidazole'),
('5Y3t7cS9Gmq9kQUY', now(), '5pFGdEw1hR3uSCgQ', 'Captopril'),
('fAWFtk1Yt3A5Jfs2', now(), '5pFGdEw1hR3uSCgQ', 'Bromexine'),
('3p29jUyRPU1FUQkc', now(), '5pFGdEw1hR3uSCgQ', 'Aspirine'),
('A3bN2Es8DXtGHDBA', now(), '5pFGdEw1hR3uSCgQ', 'Declofenac'),
('qCuCtMC5PaWJJ1sT', now(), '5pFGdEw1hR3uSCgQ', 'Spasfon'),
('q51SespX84v6Wy3V', now(), '5pFGdEw1hR3uSCgQ', 'Fluconazole'),
('Qke49P2bZ68qefaa', now(), '5pFGdEw1hR3uSCgQ', 'Ketoconazole'),
('NYCFVQFRb1kxumEN', now(), '5pFGdEw1hR3uSCgQ', 'Acyclovir '),
('wHuKWf3D9U4mbVHr', now(), '5pFGdEw1hR3uSCgQ', 'Domperidone'),
('hfK3DnmkUXGpK7RF', now(), '5pFGdEw1hR3uSCgQ', 'Promethazine'),
('xavDP3sq8wfKdbN1', now(), '5pFGdEw1hR3uSCgQ', 'Loperamide'),
('9nexJejgUCDfYk6n', now(), '5pFGdEw1hR3uSCgQ', 'Multivitamine'),
('81HuT14Dxz3f4MTY', now(), '5pFGdEw1hR3uSCgQ', 'Vitamin C');