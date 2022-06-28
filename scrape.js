const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const url =
  'https://www.amazon.co.uk/Logitech-Wireless-Keyboard-Windows-Connection/dp/B00CL6353A/ref=sr_1_1?qid=1656176258&refinements=p_89%3ALogitech&rnid=1632651031&s=videogames&sr=1-1';

const product = { name: '', price: '', link: '' };

//Set interval
const handle = setInterval(scrape, 20000);

async function scrape() {
  //Fetch the data
  const { data } = await axios.get(url);
  //Load up the html
  const $ = cheerio.load(data);
  const item = $('div#dp-container');
  //Extract the data that we need
  product.name = $(item).find('h1 span#productTitle').text();
  product.link = url;
  const price = $(item)
    .find('span .a-color-price')
    .first()
    .text()
    .replace(/[£,.]/g, '');
  const priceNum = parseInt(price);
  product.price = priceNum;
  console.log(product);
  //Send an SMS
  if (priceNum < 5000) {
    client.messages
      .create({
        body: `The price of ${product.name} went below ${price}. Purchase it at ${product.link}`,
        from: '+94770188707',
        to: '+94770188707',
      })
      .then((message) => {
        console.log(message);
        clearInterval(handle);
      });
  }
}

scrape();
