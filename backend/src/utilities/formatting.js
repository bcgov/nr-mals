// Columns of type date in the database are incorrectly parsed as midnight UTC by Prisma.
// As a result, the value in the variable is 7 or 8 hours earlier than it should be.
// When using any of the output methods that reference a locale, the wrong date will be displayed,
// because it subtracts 7 or 8 hours to account for the time zone difference.
// We can get the correct date as a string by using the ISO 8601 output format (which uses UTC)
// and discarding the timezone information.
function formatDate(date) {
  if (date === null) {
    return null;
  }

  return date.toISOString().split("T")[0];
}

module.exports = { formatDate };
