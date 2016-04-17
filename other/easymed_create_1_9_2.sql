-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2016-04-17 11:57:26.31

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
    active boolean  NOT NULL,
    english_name text  NOT NULL,
    native_name text  NULL,
    latitude real  NULL,
    longitude real  NULL,
    create_timestamp timestamp with time zone  NOT NULL,
    remark text  NULL,
    global boolean  NOT NULL DEFAULT false,
    default_suitcase_id text  NULL,
    CONSTRAINT clinics_pk PRIMARY KEY (clinic_id)
);

COMMENT ON COLUMN v2.clinics.global IS 'e.g. Office is a clinic';

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
    CONSTRAINT countries_pk PRIMARY KEY (country_id)
);

-- Table: document_types
CREATE TABLE v2.document_types (
    document_type text  NOT NULL,
    type text  NOT NULL,
    CONSTRAINT document_types_pk PRIMARY KEY (document_type)
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
    consultation_consultation_id text  NOT NULL,
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
    raspiratory_rate smallint  NULL,
    weight smallint  NULL,
    height smallint  NULL,
    temperature smallint  NULL,
    spo2 smallint  NULL,
    head_circumference real  NOT NULL,
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
    REFERENCES v2.document_types (document_type)  
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
    FOREIGN KEY (consultation_consultation_id)
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

-- End of file.

