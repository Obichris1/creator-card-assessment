const CreatorCardMessages = {
  // ── CREATE ─────────────────────────────────────
  TITLE_REQUIRED: 'Title is required',
  DESCRIPTION_INVALID: 'Description is invalid',
  SLUG_INVALID: 'Slug must contain only letters, numbers, hyphens and underscores',
  SLUG_TAKEN: 'Slug is already taken',
  CREATOR_REFERENCE_INVALID: 'creator_reference must be exactly 20 characters',

  LINKS_INVALID: 'Links format is invalid',
  SERVICE_RATES_INVALID: 'Service rates format is invalid',

  ACCESS_CODE_REQUIRED: 'access_code is required when access_type is private',
  ACCESS_CODE_NOT_ALLOWED: 'access_code must NOT be provided for public cards',
  ACCESS_CODE_INVALID: 'access_code must be exactly 6 alphanumeric characters',

  VALIDATION_ERROR: 'Validation error',

  // ── GET ────────────────────────────────────────
  CARD_NOT_FOUND: 'Creator card not found',
  CARD_IS_DRAFT: 'Creator card is not publicly available',

  ACCESS_CODE_MISSING: 'Access code is required for this card',
  ACCESS_CODE_MISMATCH: 'Access code is incorrect',

  // ── DELETE ──────────────────────────────────────
  DELETE_SUCCESS: 'Creator Card Deleted Successfully',
  CREATE_SUCCESS: 'Creator Card Created Successfully',
  GET_SUCCESS: 'Creator Card Retrieved Successfully',
};

module.exports = CreatorCardMessages;
