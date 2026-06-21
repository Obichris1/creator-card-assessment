const { throwAppError } = require('@app-core/errors');

const CreatorCardRepository = require('@app/repository/creator-cards');
const CreatorCardMessages = require('@app/messages/creator-card');
const CreatorCardErrorCodes = require('@app/messages/creator-card-codes');

function serializeCreatorCard(card) {
  const { _id, __v, access_code, ...rest } = card;

  return {
    id: _id,
    ...rest,
  };
}

async function getCreatorCard(serviceData, options = {}) {
  const { slug, access_code: suppliedAccessCode } = serviceData;

  const card = await CreatorCardRepository.findOne({
    query: {
      slug,
      deleted: null,
    },
  });

  if (!card) {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, CreatorCardErrorCodes.NOT_FOUND);
  }

  if (card.status === 'draft') {
    throwAppError(CreatorCardMessages.CARD_NOT_FOUND, CreatorCardErrorCodes.IS_DRAFT);
  }

  if (card.access_type === 'private') {
    if (!suppliedAccessCode) {
      throwAppError(
        CreatorCardMessages.ACCESS_CODE_MISSING,
        CreatorCardErrorCodes.ACCESS_CODE_MISSING
      );
    }

    if (suppliedAccessCode !== card.access_code) {
      throwAppError(
        CreatorCardMessages.ACCESS_CODE_MISMATCH,
        CreatorCardErrorCodes.ACCESS_CODE_MISMATCH
      );
    }
  }

  const response = serializeCreatorCard(card);

  return response;
}

module.exports = getCreatorCard;
