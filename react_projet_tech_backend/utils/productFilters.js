export function isBrandAttribute(attrName) {
  return attrName.toLowerCase() === 'brand';
}

export function appendAttributeFilters(sql, queryParams, filters, lang) {
  if (!filters || Object.keys(filters).length === 0) {
    return sql;
  }

  for (const [attrName, values] of Object.entries(filters)) {
    if (!Array.isArray(values) || values.length === 0) {
      continue;
    }

    const uniqueValues = [...new Set(values)];

    if (isBrandAttribute(attrName)) {
      const placeholders = uniqueValues.map(() => '?').join(',');
      sql += ` AND b.name IN (${placeholders})`;
      queryParams.push(...uniqueValues);
      continue;
    }

    const placeholders = uniqueValues.map(() => '?').join(',');

    sql += `
      AND p.id IN (
        SELECT pav.product_id
        FROM product_attribute_values pav
        JOIN attribute_translations at ON pav.attribute_id = at.attribute_id
        JOIN product_attribute_values_translations pavt ON pav.id = pavt.product_attribute_value_id
        WHERE at.name = ?
          AND at.locale = ?
          AND pavt.value IN (${placeholders})
          AND pavt.lang = ?
      )
    `;

    queryParams.push(attrName, lang, ...uniqueValues, lang);
  }

  return sql;
}
