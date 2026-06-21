const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');

const CreatorCardRepository = require('@app/repository/creator-cards');

const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCardErrorCodes = require('@app/messages/creator-card-codes');

const deleteCreatorCardSpec = `root {
  slug string<trim|lengthBetween:5,50>
  creator_reference string<trim|length:20>
}`;

const parsedDeleteCreatorCardSpec = validator.parse(deleteCreatorCardSpec);

// ── Serializer ───────────────────────────────────────────────

function serializeCreatorCard(card) {
  const { _id, __v, ...rest } = card;

  return {
    id: _id,
    ...rest,
  };
}

// ── Service ────────────────────────────────────────────────

async function deleteCreatorCard(serviceData) {
  const data = validator.validate(serviceData, parsedDeleteCreatorCardSpec);

  // Step 1: find active card
  const card = await CreatorCardRepository.findOne({
    query: {
      slug: data.slug,
      deleted: null,
    },
  });

  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, CreatorCardErrorCodes.NOT_FOUND);
  }

  // Step 2: ownership check (important because creator_reference is required in spec)
  if (card.creator_reference !== data.creator_reference) {
    throwAppError(CreatorCardMessages.UNAUTHORIZED_DELETE, CreatorCardErrorCodes.UNAUTHORIZED);
  }

  // Step 3: soft delete
  const deletedAt = Date.now();

  await CreatorCardRepository.updateOne({
    query: { slug: data.slug },
    updateValues: {
      deleted: deletedAt,
      updated: deletedAt,
    },
  });

  // Step 4: response (service returns ONLY business data)
  const response = serializeCreatorCard({
    ...card,
    deleted: deletedAt,
    updated: deletedAt,
  });

  return response;
}

module.exports = deleteCreatorCard;
