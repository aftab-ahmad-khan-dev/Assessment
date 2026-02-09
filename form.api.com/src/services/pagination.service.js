import mongoose from "mongoose";

/**
 * Generate search condition for Mongoose queries.
 * @param {any} model - Mongoose model.
 * @param {string[]} attributes - List of attributes to search.
 * @param {string} search - Search term.
 * @returns {object} - Mongoose search condition.
 */
function generateSearchCondition(model, attributes, search) {
  if (!model || !model.schema?.paths || !attributes?.length || !search)
    return {};

  const regex = new RegExp(search, "i"); // Case-insensitive regex
  return {
    $or: attributes
      .map((attr) =>
        model.schema.paths[attr] instanceof mongoose.Schema.Types.String
          ? { [attr]: { $regex: regex } }
          : null
      )
      .filter(Boolean),
  };
}

/**
 * Combined Pagination Filtration Data
 * @param {any} model - Mongoose model.
 * @param {object} reqQuery - Request query parameters.
 * @param {string} itemsName - Name for returned items.
 * @param {string[]} searchAttributes - Attributes to include in search.
 * @param {object} where - Additional query conditions.
 * @param {object} populate - Populate options for Mongoose.
 * @param {function} queryCallback - Callback to modify the query.
 * @param {number} pageStart - Page start index (0 or 1).
 * @returns {object} - Paginated data, metadata, and next page information.
 */
async function paginationFiltrationData(
  model,
  reqQuery,
  itemsName = "items",
  searchAttributes = [],
  where = {},
  populate,
  queryCallback = null,
  pageStart = 1
) {
  const {
    search = "",
    size = "10",
    page = "1",
    sort = "createdAt",
    order = "desc",
  } = reqQuery;

  const searchCondition = search
    ? generateSearchCondition(model, searchAttributes, search)
    : {};
  const whereCondition = { ...where, ...searchCondition };
  const parsedPage = Math.max(parseInt(page, 10), pageStart);
  const parsedSize = Math.max(parseInt(size, 10), 1);

  const offset = (parsedPage - pageStart) * parsedSize; // Adjust offset based on pageStart (0 or 1)
  const totalItems = await model.countDocuments(whereCondition);
  const totalPages = Math.ceil(totalItems / parsedSize);

  // Build base query
  let query = model
    .find(whereCondition)
    .skip(offset)
    .limit(parsedSize)
    .sort({ [sort]: order === "asc" ? 1 : -1 });

  // Apply populate if provided
  if (populate) {
    query = query.populate(populate);
  }

  // Apply query callback for custom modifications
  if (queryCallback) {
    query = queryCallback(query);
  }

  const items = await query;

  const pagination = {
    page: parsedPage,
    size: parsedSize,
    totalItems,
    totalPages,
    startIndex: offset,
    endIndex: Math.min(offset + parsedSize, totalItems) - 1,
    sort,
    order,
    search,
    lastPage: totalPages,
  };

  const next =
    parsedPage < totalPages
      ? {
          path: `?page=${
            parsedPage + 1
          }&size=${parsedSize}&sort=${sort}&order=${order}`,
          page: parsedPage + 1,
          size: parsedSize,
          sort,
          order,
        }
      : null;

  return {
    [itemsName]: items,
    pagination,
    next,
  };
}

export { paginationFiltrationData };

