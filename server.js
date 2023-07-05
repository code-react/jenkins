const express = require("express");
const app = express();
require("dotenv").config();
const { Client } = require("pg");
const axios = require("axios");
const qs = require("qs");
const {
  insertDataIntoPostgres,
  getRowByEmail,
  connection,
} = require("./logger");
const PORT = process.env.PORT;

app.use(express.json());

const client = new Client(connection);

client
  .connect()
  .then(() => console.log("Db connected"))
  .catch((e) => console.log("db connection failed ", e));

app.post("/form-data", (req, res) => {
  const data = req.body.data;
  console.log(data);
  insertDataIntoPostgres(data);
});

app.post("/trigger-job", async (req, res) => {
  console.log("i am trigger job api");
  const data = req.body.data;
  const email = data.contactInfo.primaryInfo.email;

  const userData = await getRowByEmail(process.env.COLUMN_NAME, email);
  console.log(userData, "userdata");

  console.log("api runnging", new Date());
  async function triggerJenkinsJob() {
    try {
      const params = {
        branchName: "OVH/prod",
        APP_DOMAIN: `${userData.domain}.gptlms.ai`,
        TLS_DOMAIN: `${userData.domain}.gptlms.ai`,
        NODE_ENV: `prod-${userData.domain}`,
        googleTagCode: "G-358N6HSR47",
        subtitlePortal: `${userData.domain}`,
        hostName: `${userData.domain}gptlms`,
        portalTitle: userData.domain,
        portalDescription: `Welcome to the ${userData.domain} ChatGPT learning Platform.`,
        portalName: `${userData.domain} Consulting`,
        portalColor: "#019444",
        contactUsLink: `https://${userData.domain}consulting.com.au/#support`,
        portalAccessCode: "d4RR3n@$!",
        DB_USER: `${userData.domain}portal`,
        DB_NAME: `${userData.domain}portal`,
        noreplyEmail: "",
        realm: `${userData.domain}gptlms`,
        email: `${userData.first_name}@${userData.domain}consulting.com.au`,
        firstname: userData.first_name,
        lastname: userData.last_name,
        password: userData.email,
        CHART_VALUES: "/dev/null",
        STORAGE_SIZE: "1Gi",
      };

      const response = await axios.post(
        `${process.env.JENKINS_URL}/job/${process.env.JENKINS_JOBNAME}/buildWithParameters`,
        qs.stringify(params),
        {
          auth: {
            username: process.env.JENKINS_USERNAME,
            password: process.env.JENKINS_TOKEN,
          },
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log(
        `Jenkins job triggered successfully.
              status:${response.status}
              message:${response.statusText}
              date:${response.headers.date}`
      );

      res.json({
        message: "Jenkins job triggered successfully",
        status: response.status,
        server_message: response.statusText,
        date: response.headers.date,
      });
    } catch (error) {
      console.log(error);
      res.json({
        status: error.response.status,
        message: "Error triggering Jenkins job",
        error: error.response.data,
      });
    }
  }

  await triggerJenkinsJob();
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
