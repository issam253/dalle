const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const faker = require('faker');
const crypto = require('crypto');



const generateRandomString = (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};

const getMailDomains = async () => {
    const url = 'https://api.mail.tm/domains';
    try {
        const response = await axios.get(url);
        if (response.status === 200) {
            return response.data['hydra:member'];
        } else {
            console.log(`[×] E-mail Error : ${response.data}`);
            return null;
        }
    } catch (error) {
        console.log(`[×] Error : ${error}`);
        return null;
    }
};

const createMailTmAccount = async () => {
    const mailDomains = await getMailDomains();
    if (mailDomains) {
        const domain = mailDomains[Math.floor(Math.random() * mailDomains.length)].domain;
        const username = generateRandomString(10);
        const password = faker.internet.password();
        const birthday = faker.date.past(18, new Date(2002, 0, 1));
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const url = 'https://api.mail.tm/accounts';
        const headers = { 'Content-Type': 'application/json' };
        const data = { address: `${username}@${domain}`, password: password };

        try {
            const response = await axios.post(url, data, { headers: headers });
            if (response.status === 201) {
                return { email: `${username}@${domain}`, password, firstName, lastName, birthday };
            } else {
                console.log(`[×] Email Error : ${response.data}`);
                return null;
            }
        } catch (error) {
            console.log(`[×] Error : ${error}`);
            return null;
        }
    }
};

const registerFacebookAccount = async (email, password, firstName, lastName, birthday) => {
    const api_key = '882a8490361da98702bf97a021ddc14d';
    const secret = '62f8ce9f74b12f84c123cc23437a4a32';
    const gender = Math.random() > 0.5 ? 'M' : 'F';
    const req = {
        api_key: api_key,
        attempt_login: true,
        birthday: birthday.toISOString().split('T')[0],
        client_country_code: 'EN',
        fb_api_caller_class: 'com.facebook.registration.protocol.RegisterAccountMethod',
        fb_api_req_friendly_name: 'registerAccount',
        firstname: firstName,
        format: 'json',
        gender: gender,
        lastname: lastName,
        email: email,
        locale: 'en_US',
        method: 'user.register',
        password: password,
        reg_instance: generateRandomString(32),
        return_multiple_errors: true
    };

    const sortedReq = Object.keys(req).sort().reduce((result, key) => {
        result[key] = req[key];
        return result;
    }, {});

    const sig = Object.entries(sortedReq).map(([key, value]) => `${key}=${value}`).join('') + secret;
    req.sig = crypto.createHash('md5').update(sig).digest('hex');

    const apiUrl = 'https://b-api.facebook.com/method/user.register';
    try {
        const response = await axios.post(apiUrl, req);
        if (response.data) {
            const { new_user_id, session_info } = response.data;
            const token = session_info.access_token;
            return { id: new_user_id, token, email, password, firstName, lastName, birthday, gender };
        }
    } catch (error) {
        console.log(`[×] Error : ${error}`);
    }
    return null;
};


exports.name = "/create";
exports.index = async (req, res) => {
    const count = parseInt(req.query.count, 10) || 1;
    const accounts = [];

    for (let i = 0; i < count; i++) {
        const mailAccount = await createMailTmAccount();
        if (mailAccount) {
            const fbAccount = await registerFacebookAccount(
                mailAccount.email,
                mailAccount.password,
                mailAccount.firstName,
                mailAccount.lastName,
                mailAccount.birthday
            );
            if (fbAccount) {
                accounts.push(fbAccount);
            }
        }
    }

    res.json(accounts);
};