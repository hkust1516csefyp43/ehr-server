-- Created by Vertabelo (http://vertabelo.com)
-- Last modification date: 2015-11-04 10:08:53.784




-- tables
-- Table: Comment
CREATE TABLE Comment (
    comment_id text  NOT NULL,
    user_id text  NOT NULL,
    comment text  NOT NULL,
    timestamp timestamp  NOT NULL,
    visit_id text  NOT NULL,
    CONSTRAINT Comment_pk PRIMARY KEY (comment_id)
);



-- Table: Consultation
CREATE TABLE Consultation (
    consultation_id text  NOT NULL,
    user_id text  NOT NULL,
    start_time timestamp  NOT NULL,
    end_time timestamp  NOT NULL,
    medication_remark text  NULL,
    diagnosis_id text  NULL,
    treatment_id text  NULL,
    CONSTRAINT Consultation_pk PRIMARY KEY (consultation_id)
);



-- Table: Country
CREATE TABLE Country (
    counry_id text  NOT NULL,
    english_name text  NOT NULL,
    native_name text  NULL,
    phone_country_code int  NOT NULL,
    phone_number_format text  NULL,
    create_timestamp timestamp  NOT NULL,
    CONSTRAINT Country_pk PRIMARY KEY (counry_id)
);



-- Table: Diagnosis
CREATE TABLE Diagnosis (
    diagnosis_id text  NOT NULL,
    webbed_url text  NOT NULL,
    name text  NOT NULL,
    symptoms text  NOT NULL,
    description text  NOT NULL,
    CONSTRAINT Diagnosis_pk PRIMARY KEY (diagnosis_id)
);



-- Table: Diagnosis_history
CREATE TABLE Diagnosis_history (
    diagnosis_history_id text  NOT NULL,
    diagnosis_id text  NULL,
    triage_id text  NULL,
    consultation_id text  NULL,
    start_date timestamp  NULL,
    remission_date timestamp  NULL,
    is_under_treatment text  NULL,
    remark text  NULL,
    patient_id text  NOT NULL,
    CONSTRAINT Diagnosis_history_pk PRIMARY KEY (diagnosis_history_id)
);



-- Table: Inventory
CREATE TABLE Inventory (
    inventory_id text  NOT NULL,
    name varchar(50)  NOT NULL,
    batch_number text  NOT NULL,
    barcode_number text  NOT NULL,
    expiry_date timestamp  NULL,
    treatment_id text  NULL,
    CONSTRAINT Inventory_pk PRIMARY KEY (inventory_id)
);



-- Table: Inventory_update
CREATE TABLE Inventory_update (
    inventory_update_id text  NOT NULL,
    inventory_id text  NOT NULL,
    old_value int  NOT NULL,
    new_value int  NOT NULL,
    timestamp timestamp  NOT NULL,
    remark text  NULL,
    user_id text  NOT NULL,
    receipt_id text  NULL,
    CONSTRAINT Inventory_update_pk PRIMARY KEY (inventory_update_id)
);



-- Table: Patient
CREATE TABLE Patient (
    patient_id text  NOT NULL,
    honorific text  NULL,
    first_name text  NOT NULL,
    middle_name text  NULL,
    last_name text  NULL,
    phone_country_id text  NULL,
    phone_number int  NULL,
    address text  NOT NULL,
    birth_year int  NULL,
    birth_month int  NULL,
    birth_day int  NULL,
    gender int  NULL,
    photo int  NULL,
    next_station int  NULL,
    tag_number int  NULL,
    slum_id text  NULL,
    blood_type text  NULL,
    create_timestamp timestamp  NOT NULL,
    last_seen timestamp  NOT NULL,
    CONSTRAINT Patient_pk PRIMARY KEY (patient_id)
);



-- Table: Pharmacy
CREATE TABLE Pharmacy (
    pharmacy_id text  NOT NULL,
    user_id text  NOT NULL,
    start_time timestamp  NOT NULL,
    end_time timestamp  NOT NULL,
    CONSTRAINT Pharmacy_pk PRIMARY KEY (pharmacy_id)
);



-- Table: Receipt
CREATE TABLE Receipt (
    receipt_id text  NOT NULL,
    receipt_photo text  NOT NULL,
    remark text  NULL,
    user_id text  NOT NULL,
    timestamp timestamp  NOT NULL,
    CONSTRAINT Receipt_pk PRIMARY KEY (receipt_id)
);



-- Table: Relationship
CREATE TABLE Relationship (
    relationship_id text  NOT NULL,
    patient_id_1 text  NOT NULL,
    patient_id_2 text  NOT NULL,
    relationship text  NULL,
    create_timestamp timestamp  NOT NULL,
    CONSTRAINT Relationship_pk PRIMARY KEY (relationship_id)
);



-- Table: Role
CREATE TABLE Role (
    clearance_id text  NOT NULL,
    name text  NOT NULL,
    read_patient_record boolean  NOT NULL,
    add_to_inventory boolean  NOT NULL,
    add_slum boolean  NOT NULL,
    add_medication_method boolean  NOT NULL,
    consulte_patient boolean  NOT NULL,
    read_triage boolean  NOT NULL,
    read_consultation boolean  NOT NULL,
    read_pharmacy boolean  NOT NULL,
    add_comment boolean  NOT NULL,
    revoke_any_token boolean  NOT NULL,
    read_inventory boolean  NOT NULL,
    reset_any_password boolean  NOT NULL,
    delete_patient boolean  NOT NULL,
    add_patient boolean  NOT NULL,
    add_visit boolean  NOT NULL,
    add_diagnose boolean  NOT NULL,
    add_relationship boolean  NOT NULL,
    delete_relationship boolean  NOT NULL,
    add_treatment boolean  NOT NULL,
    modify_treatment boolean  NOT NULL,
    modify_any_clearance boolean  NOT NULL,
    add_clearance boolean  NOT NULL,
    add_user boolean  NOT NULL,
    CONSTRAINT Role_pk PRIMARY KEY (clearance_id)
);



-- Table: Slum
CREATE TABLE Slum (
    slum_id text  NOT NULL,
    name text  NOT NULL,
    latitude decimal(10,4)  NULL,
    longitude decimal(10,4)  NULL,
    country_id text  NOT NULL,
    last_visit timestamp  NULL,
    active boolean  NOT NULL,
    CONSTRAINT Slum_pk PRIMARY KEY (slum_id)
);



-- Table: Token
CREATE TABLE Token (
    token text  NOT NULL,
    user_id text  NOT NULL,
    expiry_timestamp timestamp  NOT NULL,
    device_id text  NOT NULL,
    access_token boolean  NOT NULL,
    CONSTRAINT Token_pk PRIMARY KEY (token)
);



-- Table: Treatment
CREATE TABLE Treatment (
    treatment_id text  NOT NULL,
    name text  NOT NULL,
    usage text  NOT NULL,
    dosage int  NOT NULL,
    frequency int  NOT NULL,
    form int  NOT NULL,
    concentration int  NULL,
    webmd_url text  NULL,
    diagnose_id text  NOT NULL,
    CONSTRAINT Treatment_pk PRIMARY KEY (treatment_id)
);



-- Table: Triage
CREATE TABLE Triage (
    triage_id text  NOT NULL,
    user_id text  NOT NULL,
    start_time timestamp  NOT NULL,
    end_time timestamp  NOT NULL,
    diastolic int  NULL,
    systolic int  NULL,
    heart_rate int  NULL,
    weight int  NULL,
    height int  NULL,
    temperature int  NULL,
    spo2 int  NULL,
    marital_status int  NULL,
    respiratory_rate int  NULL,
    last_deworming_date date  NULL,
    CONSTRAINT Triage_pk PRIMARY KEY (triage_id)
);



-- Table: "User"
CREATE TABLE "User" (
    user_id text  NOT NULL,
    honorific text  NULL,
    first_name text  NOT NULL,
    middle_name text  NULL,
    last_name text  NULL,
    phone_country_id text  NOT NULL,
    phone_number int  NOT NULL,
    photo int  NULL,
    address text  NULL,
    salt text  NOT NULL,
    processed_password text  NOT NULL,
    birth_year int  NULL,
    birth_month int  NULL,
    birth_day int  NULL,
    role_id text  NOT NULL,
    email text  NULL,
    create_timestamp timestamp  NOT NULL,
    last_login timestamp  NULL,
    CONSTRAINT email UNIQUE (email) NOT DEFERRABLE  INITIALLY IMMEDIATE,
    CONSTRAINT User_pk PRIMARY KEY (user_id)
);



-- Table: Visit
CREATE TABLE Visit (
    visit_id text  NOT NULL,
    consultation_id text  NULL,
    triage_triage_id text  NULL,
    pharmacy_pharmacy_id text  NULL,
    patient_id text  NOT NULL,
    date date  NOT NULL,
    CONSTRAINT Visit_pk PRIMARY KEY (visit_id)
);







-- foreign keys
-- Reference:  Comment_User (table: Comment)


ALTER TABLE Comment ADD CONSTRAINT Comment_User 
    FOREIGN KEY (user_id)
    REFERENCES "User" (user_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Comment_Visit (table: Comment)


ALTER TABLE Comment ADD CONSTRAINT Comment_Visit 
    FOREIGN KEY (visit_id)
    REFERENCES Visit (visit_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Consultation_Diagnose (table: Consultation)


ALTER TABLE Consultation ADD CONSTRAINT Consultation_Diagnose 
    FOREIGN KEY (diagnosis_id)
    REFERENCES Diagnosis (diagnosis_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Consultation_Medication (table: Consultation)


ALTER TABLE Consultation ADD CONSTRAINT Consultation_Medication 
    FOREIGN KEY (treatment_id)
    REFERENCES Treatment (treatment_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Consultation_User (table: Consultation)


ALTER TABLE Consultation ADD CONSTRAINT Consultation_User 
    FOREIGN KEY (user_id)
    REFERENCES "User" (user_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Diagnose_history_Consultation (table: Diagnosis_history)


ALTER TABLE Diagnosis_history ADD CONSTRAINT Diagnose_history_Consultation 
    FOREIGN KEY (consultation_id)
    REFERENCES Consultation (consultation_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Diagnose_history_Diagnose (table: Diagnosis_history)


ALTER TABLE Diagnosis_history ADD CONSTRAINT Diagnose_history_Diagnose 
    FOREIGN KEY (diagnosis_id)
    REFERENCES Diagnosis (diagnosis_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Diagnose_history_Patient (table: Diagnosis_history)


ALTER TABLE Diagnosis_history ADD CONSTRAINT Diagnose_history_Patient 
    FOREIGN KEY (patient_id)
    REFERENCES Patient (patient_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Diagnose_history_Triage (table: Diagnosis_history)


ALTER TABLE Diagnosis_history ADD CONSTRAINT Diagnose_history_Triage 
    FOREIGN KEY (triage_id)
    REFERENCES Triage (triage_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Inventory_Medication (table: Inventory)


ALTER TABLE Inventory ADD CONSTRAINT Inventory_Medication 
    FOREIGN KEY (treatment_id)
    REFERENCES Treatment (treatment_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Inventory_update_Inventory (table: Inventory_update)


ALTER TABLE Inventory_update ADD CONSTRAINT Inventory_update_Inventory 
    FOREIGN KEY (inventory_id)
    REFERENCES Inventory (inventory_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Inventory_update_Receipt (table: Inventory_update)


ALTER TABLE Inventory_update ADD CONSTRAINT Inventory_update_Receipt 
    FOREIGN KEY (receipt_id)
    REFERENCES Receipt (receipt_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Inventory_update_User (table: Inventory_update)


ALTER TABLE Inventory_update ADD CONSTRAINT Inventory_update_User 
    FOREIGN KEY (user_id)
    REFERENCES "User" (user_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Patient_Country (table: Patient)


ALTER TABLE Patient ADD CONSTRAINT Patient_Country 
    FOREIGN KEY (phone_country_id)
    REFERENCES Country (counry_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Patient_Relationship (table: Relationship)


ALTER TABLE Relationship ADD CONSTRAINT Patient_Relationship 
    FOREIGN KEY (patient_id_1)
    REFERENCES Patient (patient_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Patient_Relationship2 (table: Relationship)


ALTER TABLE Relationship ADD CONSTRAINT Patient_Relationship2 
    FOREIGN KEY (patient_id_2)
    REFERENCES Patient (patient_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Patient_Slum (table: Patient)


ALTER TABLE Patient ADD CONSTRAINT Patient_Slum 
    FOREIGN KEY (slum_id)
    REFERENCES Slum (slum_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Pharmacy_User (table: Pharmacy)


ALTER TABLE Pharmacy ADD CONSTRAINT Pharmacy_User 
    FOREIGN KEY (user_id)
    REFERENCES "User" (user_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Slum_Country (table: Slum)


ALTER TABLE Slum ADD CONSTRAINT Slum_Country 
    FOREIGN KEY (country_id)
    REFERENCES Country (counry_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Token_User (table: Token)


ALTER TABLE Token ADD CONSTRAINT Token_User 
    FOREIGN KEY (user_id)
    REFERENCES "User" (user_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Treatment_Diagnose (table: Treatment)


ALTER TABLE Treatment ADD CONSTRAINT Treatment_Diagnose 
    FOREIGN KEY (diagnose_id)
    REFERENCES Diagnosis (diagnosis_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Triage_User (table: Triage)


ALTER TABLE Triage ADD CONSTRAINT Triage_User 
    FOREIGN KEY (user_id)
    REFERENCES "User" (user_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  User_Country (table: "User")


ALTER TABLE "User" ADD CONSTRAINT User_Country 
    FOREIGN KEY (phone_country_id)
    REFERENCES Country (counry_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  User_Role (table: "User")


ALTER TABLE "User" ADD CONSTRAINT User_Role 
    FOREIGN KEY (role_id)
    REFERENCES Role (clearance_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Visit_Consultation (table: Visit)


ALTER TABLE Visit ADD CONSTRAINT Visit_Consultation 
    FOREIGN KEY (consultation_id)
    REFERENCES Consultation (consultation_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Visit_Patient (table: Visit)


ALTER TABLE Visit ADD CONSTRAINT Visit_Patient 
    FOREIGN KEY (patient_id)
    REFERENCES Patient (patient_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Visit_Pharmacy (table: Visit)


ALTER TABLE Visit ADD CONSTRAINT Visit_Pharmacy 
    FOREIGN KEY (pharmacy_pharmacy_id)
    REFERENCES Pharmacy (pharmacy_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;

-- Reference:  Visit_Triage (table: Visit)


ALTER TABLE Visit ADD CONSTRAINT Visit_Triage 
    FOREIGN KEY (triage_triage_id)
    REFERENCES Triage (triage_id)
    NOT DEFERRABLE 
    INITIALLY IMMEDIATE 
;






-- End of file.

