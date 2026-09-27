const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

const parsePositiveInteger = (value, fallback) => {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    return fallback;
  }

  return number;
};

const getPagination = (query = {}) => {
  const page = parsePositiveInteger(
    query.page,
    DEFAULT_PAGE
  );

  const requestedLimit = parsePositiveInteger(
    query.limit,
    DEFAULT_LIMIT
  );

  const limit = Math.min(requestedLimit, MAX_LIMIT);

  const offset = (page - 1) * limit;

  return {
    page,
    limit,
    offset,
  };
};

const getPaginationMeta = ({
  page,
  limit,
  total,
}) => {
  const totalItems = Number(total) || 0;

  const totalPages =
    totalItems === 0
      ? 0
      : Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    total: totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1 && totalPages > 0,
  };
};

module.exports = {
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
  getPagination,
  getPaginationMeta,
};