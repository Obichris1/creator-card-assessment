const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const crypto = require('crypto');

const CreatorCardRepository = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCardErrorCodes = require('@app/messages/creator-card-codes');

const createCreatorCardSpec = `root {
  title string
  description? string
  slug? string
  creator_reference string
  links? array
  service_rates? object
  status string(draft|published)
  access_type? string(public|private)
  access_code? string
}`;

const parsedCreateCreatorCardSpec = validator.parse(createCreatorCardSpec);

const VALID_CURRENCIES = ['NGN', 'USD', 'GBP', 'GHS'];

const SLUG_ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_';
const SLUGIFY_ALLOWED_CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789-_';
const ALPHANUMERIC_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function serializeCreatorCard(card) {
  const { _id, __v, ...rest } = card;

  return {
    id: _id,
    ...rest,
  };
}

function assertLength(value, field, min, max, required = false) {
  if (value === undefined || value === null) {
    if (required) {
      throwAppError(`${field} is required`, 'VALIDATIONERR');
    }
    return;
  }

  if (typeof value !== 'string') {
    throwAppError(`${field} must be a string`, 'VALIDATIONERR');
  }

  if (value.length < min || value.length > max) {
    throwAppError(`${field} must be between ${min} and ${max} characters`, 'VALIDATIONERR');
  }
}

// ── Regex-free string helpers ───────────────────────────────────────────

function isOnlyAllowedChars(value, allowedChars) {
  for (let i = 0; i < value.length; i++) {
    if (!allowedChars.includes(value[i])) {
      return false;
    }
  }
  return true;
}

function startsWithHttpPrefix(url) {
  return url.startsWith('http://') || url.startsWith('https://');
}

function isExactlySixAlphanumeric(code) {
  if (code.length !== 6) return false;
  return isOnlyAllowedChars(code, ALPHANUMERIC_CHARS);
}

function slugifyTitle(title) {
  const lowered = title.toLowerCase().trim();
  let result = '';
  let lastWasSpace = false;

  for (let i = 0; i < lowered.length; i++) {
    const char = lowered[i];
    const isWhitespace = char === ' ' || char === '\t' || char === '\n';

    if (isWhitespace) {
      if (!lastWasSpace) {
        result += '-';
        lastWasSpace = true;
      }
    } else if (SLUGIFY_ALLOWED_CHARS.includes(char)) {
      result += char;
      lastWasSpace = false;
    }
    // any other char (punctuation, symbols, etc.) is silently dropped
  }

  return result;
}

// ── Validators ───────────────────────────────────────────────────────────

function validateLinks(links) {
  if (links === undefined) return;

  if (!Array.isArray(links)) {
    throwAppError('links must be an array', 'VALIDATIONERR');
  }

  links.forEach((link, index) => {
    if (!link || typeof link !== 'object') {
      throwAppError(`links[${index}] must be an object`, 'VALIDATIONERR');
    }

    assertLength(link.title, `links[${index}].title`, 1, 100, true);

    if (typeof link.url !== 'string' || link.url.length > 200) {
      throwAppError(
        `links[${index}].url must be a string with max 200 characters`,
        'VALIDATIONERR'
      );
    }

    if (!startsWithHttpPrefix(link.url)) {
      throwAppError(`links[${index}].url must start with http:// or https://`, 'VALIDATIONERR');
    }
  });
}

function validateServiceRates(serviceRates) {
  if (serviceRates === undefined) return;

  if (typeof serviceRates !== 'object' || serviceRates === null) {
    throwAppError('service_rates must be an object', 'VALIDATIONERR');
  }

  const { currency, rates } = serviceRates;

  if (!VALID_CURRENCIES.includes(currency)) {
    throwAppError(
      `service_rates.currency must be one of ${VALID_CURRENCIES.join(', ')}`,
      'VALIDATIONERR'
    );
  }

  if (!Array.isArray(rates) || rates.length === 0) {
    throwAppError('service_rates.rates must be a non-empty array', 'VALIDATIONERR');
  }

  rates.forEach((rate, index) => {
    if (!rate || typeof rate !== 'object') {
      throwAppError(`service_rates.rates[${index}] must be an object`, 'VALIDATIONERR');
    }

    assertLength(rate.name, `service_rates.rates[${index}].name`, 3, 100, true);

    if (rate.description !== undefined) {
      assertLength(rate.description, `service_rates.rates[${index}].description`, 0, 250);
    }

    if (typeof rate.amount !== 'number' || !Number.isInteger(rate.amount) || rate.amount < 1) {
      throwAppError(
        `service_rates.rates[${index}].amount must be a positive integer (min 1)`,
        'VALIDATIONERR'
      );
    }
  });
}

function validateAccessRules(accessType, accessCode) {
  const resolvedAccessType = accessType || 'public';

  if (resolvedAccessType === 'private') {
    if (!accessCode) {
      throwAppError(
        CreatorCardMessages.ACCESS_CODE_REQUIRED,
        CreatorCardErrorCodes.ACCESS_CODE_REQUIRED
      );
    }

    if (!isExactlySixAlphanumeric(accessCode)) {
      throwAppError(
        CreatorCardMessages.ACCESS_CODE_INVALID,
        CreatorCardErrorCodes.ACCESS_CODE_INVALID
      );
    }
  } else if (accessCode) {
    throwAppError(
      CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED,
      CreatorCardErrorCodes.ACCESS_CODE_NOT_ALLOWED
    );
  }

  return resolvedAccessType;
}

function generateRandomSuffix(length = 6) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';

  let suffix = '';

  for (let i = 0; i < length; i++) {
    suffix += chars[crypto.randomInt(0, chars.length)];
  }

  return suffix;
}

async function isSlugTaken(slug) {
  const existing = await CreatorCardRepository.findOne({
    query: { slug },
  });

  return !!existing;
}

async function resolveSlug(providedSlug, title) {
  if (providedSlug) {
    assertLength(providedSlug, 'slug', 5, 50, true);

    if (!isOnlyAllowedChars(providedSlug, SLUG_ALLOWED_CHARS)) {
      throwAppError(CreatorCardMessages.SLUG_INVALID, CreatorCardErrorCodes.SLUG_INVALID);
    }

    const taken = await isSlugTaken(providedSlug);

    if (taken) {
      throwAppError(CreatorCardMessages.SLUG_TAKEN, CreatorCardErrorCodes.SLUG_TAKEN);
    }

    return providedSlug;
  }

  let candidate = slugifyTitle(title);

  const tooShort = candidate.length < 5;
  const taken = tooShort ? false : await isSlugTaken(candidate);

  if (tooShort || taken) {
    candidate = `${candidate}-${generateRandomSuffix(6)}`;
  }

  return candidate;
}

async function createCreatorCard(serviceData, options = {}) {
  const validatedData = validator.validate(serviceData, parsedCreateCreatorCardSpec);

  assertLength(validatedData.title, 'title', 3, 100, true);

  if (validatedData.description !== undefined) {
    assertLength(validatedData.description, 'description', 0, 500);
  }

  if (
    typeof validatedData.creator_reference !== 'string' ||
    validatedData.creator_reference.length !== 20
  ) {
    throwAppError(CreatorCardMessages.CREATOR_REFERENCE_INVALID, 'VALIDATIONERR');
  }

  validateLinks(validatedData.links);
  validateServiceRates(validatedData.service_rates);

  const resolvedAccessType = validateAccessRules(
    validatedData.access_type,
    validatedData.access_code
  );

  const resolvedSlug = await resolveSlug(validatedData.slug, validatedData.title);

  const createdCard = await CreatorCardRepository.create({
    title: validatedData.title,
    description: validatedData.description ?? null,
    slug: resolvedSlug,
    creator_reference: validatedData.creator_reference,
    links: validatedData.links ?? [],
    service_rates: validatedData.service_rates ?? null,
    status: validatedData.status,
    access_type: resolvedAccessType,
    access_code: resolvedAccessType === 'private' ? validatedData.access_code : null,
    deleted: null,
  });

  const response = serializeCreatorCard(createdCard);

  return response;
}

module.exports = createCreatorCard;
