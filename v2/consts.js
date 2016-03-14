module.exports = {
  max_image_size: function () {
    return 500000;
  },
  id_random_string_length: function () {
    return 16;
  },
  list_limit: function () {
    return 100;
  },
  version_table_prefix: function () {
    return "v2.";
  },
  table_attachments: function () {
    //TODO check if this works: return this.version_table_prefix() + "attachments";
    return "v2.attachments";
  },
  table_blocked_devices: function () {
    return "v2.blocked_devices";
  },
  table_blood_types: function () {
    return "v2.blood_types";
  },
  table_clinics: function () {
    return "v2.clinics";
  },
  table_comments: function () {
    return "v2.comments";
  },
  table_consultation_attachments: function () {
    return "v2.consultation_attachments";
  },
  table_consultations: function () {
    return "v2.consultations";
  },
  table_countries: function () {
    return "v2.countries";
  },
  table_document_types: function () {
    return "v2.document_types";
  },
  table_documents: function () {
    return "v2.documents";
  },
  table_emergency_contacts: function () {
    return "v2.emergency_contacts";
  },
  table_genders: function () {
    return "v2.genders";
  },
  table_investigation_attachments: function () {
    return "v2.investigation_attachments";
  },
  table_investigations: function () {
    return "v2.investigations";
  },
  table_keywords: function () {
    return "v2.keywords";
  },
  table_medication_variants: function () {
    return "v2.medication_variants";
  },
  table_medications: function () {
    return "v2.medications";
  },
  table_notifications: function () {
    return "v2.notifications";
  },
  table_patients: function () {
    return "v2.patients";
  },
  table_pharmacies: function () {
    return "v2.pharmacies";
  },
  table_prescriptions: function () {
    return "v2.prescriptions";
  },
  table_related_data: function () {
    return "v2.related_data";
  },
  table_relationship_types: function () {
    return "v2.relationship_types";
  },
  table_relationships: function () {
    return "v2.relationships";
  },
  table_roles: function () {
    return "v2.roles";
  },
  table_suitcases: function () {
    return "v2.suitcases";
  },
  table_tokens: function () {
    return "v2.tokens";
  },
  table_triages: function () {
    return "v2.triages";
  },
  table_users: function () {
    return "v2.users";
  },
  table_visits: function () {
    return "v2.visits";
  }
};