const pgp = require("pg-promise")();

const connection = {
  user: process.env.USER,
  host: process.env.HOST,
  database: process.env.DATABASE,
  password: process.env.PASSWORD,
  port: process.env.DB_PORT,
};

const db = pgp(connection);

// const logToPostgreSQL = async (level, message, meta) => {
//   try {
//     await db.none(
//       "INSERT INTO winston_logs (level, message, meta, timestamp) VALUES ($1, $2, $3, $4)",
//       [level, message, JSON.stringify(meta), new Date()]
//     );
//     console.log("Log entry saved to PostgreSQL");
//   } catch (error) {
//     console.error("Error saving log entry:", error);
//   }
// };

async function insertDataIntoPostgres(data) {
  try {
    const {
      "form-id": formId,
      "contact.Name.Last": lastName,
      "field:comp-ljfcawfu": address,
      "field:comp-ljfc5pnv": fieldCompLjfc5pnv,
      "field:comp-ljfcakw7": phoneNumber,
      "contact.Email[0]": email,
      "field:comp-ljfcaecd": domain,
      "form-name": formName,
      "contact.Name.First": firstName,
      "field:comp-ljfc5po5": fieldCompLjfc5po5,
      "field:comp-ljfciw6h": country,
      "field:comp-ljfc5po71": contactEmail,
      "contact.Id": contactId,
      metaSiteId,
    } = data;

    const query = `
      INSERT INTO ${process.env.DB_TABLE_NAME} (
        form_id,
        last_name,
        address,
        field_comp_ljfc5pnv,
        phone_number,
        email,
        domain,
        form_name,
        first_name,
        field_comp_ljfc5po5,
        country,
        contact_email,
        contact_id,
        meta_site_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `;

    const result = await db.query(query, [
      formId,
      lastName,
      address,
      fieldCompLjfc5pnv,
      phoneNumber,
      email,
      domain,
      formName,
      firstName,
      fieldCompLjfc5po5,
      country,
      contactEmail,
      contactId,
      metaSiteId,
    ]);

    console.log("Data inserted successfully");
  } catch (error) {
    console.error("Error inserting data:", error);
  }
}

async function getRowByEmail(emailColumnName, emailValue) {
  try {
    const query = `SELECT * FROM your_table_name WHERE ${emailColumnName} = $1`;
    const values = [emailValue];
    const result = await db.query(query, values);

    if (result.length > 0) {
      return result[0];
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error executing query:", error);
  }
}

module.exports = {
  insertDataIntoPostgres,
  getRowByEmail,
  connection,
};
