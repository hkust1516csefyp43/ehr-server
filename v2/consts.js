module.exports = {
  max_image_size: function () {
    return 500000;
  },
  id_random_string_length: function () {
    return 16;
  },
  list_limit: function () {
    return 500;
  },
  version: function () {
    return "v2";
  },
  version_table_prefix: function () {
    return this.version() + ".";
  },
  table_attachments: function () {
    return this.version_table_prefix() + "attachments";
  },
  table_blocked_devices: function () {
    return this.version_table_prefix() + "blocked_devices";
  },
  table_blood_types: function () {
    return this.version_table_prefix() + "blood_types";
  },
  table_clinics: function () {
    return this.version_table_prefix() + "clinics";
  },
  table_comments: function () {
    return this.version_table_prefix() + "comments";
  },
  table_consultation_attachments: function () {
    return this.version_table_prefix() + "consultation_attachments";
  },
  table_consultations: function () {
    return this.version_table_prefix() + "consultations";
  },
  table_countries: function () {
    return this.version_table_prefix() + "countries";
  },
  table_document_types: function () {
    return this.version_table_prefix() + "document_types";
  },
  table_documents: function () {
    return this.version_table_prefix() + "documents";
  },
  table_emergency_contacts: function () {
    return this.version_table_prefix() + "emergency_contacts";
  },
  table_genders: function () {
    return this.version_table_prefix() + "genders";
  },
  table_investigation_attachments: function () {
    return this.version_table_prefix() + "investigation_attachments";
  },
  table_investigations: function () {
    return this.version_table_prefix() + "investigations";
  },
  table_keywords: function () {
    return this.version_table_prefix() + "keywords";
  },
  table_medication_variants: function () {
    return this.version_table_prefix() + "medication_variants";
  },
  table_medications: function () {
    return this.version_table_prefix() + "medications";
  },
  table_notifications: function () {
    return this.version_table_prefix() + "notifications";
  },
  table_patients: function () {
    return this.version_table_prefix() + "patients";
  },
  table_pharmacies: function () {
    return this.version_table_prefix() + "pharmacies";
  },
  table_prescriptions: function () {
    return this.version_table_prefix() + "prescriptions";
  },
  table_queries: function() {
    return this.version_table_prefix() + "queries";
  },
  table_related_data: function () {
    return this.version_table_prefix() + "related_data";
  },
  table_relationship_types: function () {
    return this.version_table_prefix() + "relationship_types";
  },
  table_relationships: function () {
    return this.version_table_prefix() + "relationships";
  },
  table_roles: function () {
    return this.version_table_prefix() + "roles";
  },
  table_suitcases: function () {
    return this.version_table_prefix() + "suitcases";
  },
  table_tokens: function () {
    return this.version_table_prefix() + "tokens";
  },
  table_triages: function () {
    return this.version_table_prefix() + "triages";
  },
  table_users: function () {
    return this.version_table_prefix() + "users";
  },
  table_visits: function () {
    return this.version_table_prefix() + "visits";
  }
};