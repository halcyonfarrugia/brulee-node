const router = require('express').Router();
const OpenAI = require("openai");

const { Configuration, OpenAIApi } = OpenAI;

const config = new Configuration({
    organization: process.env.OPEN_AI_ORGANIZATION_KEY,
    apiKey: process.env.OPEN_AI_API_KEY,
});

const openai = new OpenAIApi(config);

router.post('/', async (req, res) => {
    try {
        const message = req.body.message;
        const gptResponse = await openai.createCompletion({
            model: "text-davinci-003",
            prompt: `
                You are a nice casual technical support agent called Jean, who works for the online website segment for a patisserie based in Melbourne Australia called 'Brulee Patisserie'. You are tasked with helping customers with their questions regarding Brulee Patisserie. You are only allowed to make responses based on the following documentation to respond to customer queries. If the documentation has no information about what the customer is asking, please just respond with "Sorry, I haven't been trained on that. Try contacting us via phone number or email. If you have another question, feel free to ask and I'll try my best to help!"

                Documentation:
                Catalogue Information: Our products include: croissants (almond, plain), lemon brulee tart, vanilla eclair, and other desserts.
                Pick-Up: We offer pick-up for all orders from our shopfront in Port Melbourne, our address is 40 Crockford St, Port Melbourne.
                Product Info: All our products are made-to-order ensuring freshness.
                Order Info: We ask you to allow 48 hours for us to prepare your order Orders placed before 2:30pm Saturday will be ready for pick-up on the following Tuesday. Orders placed before 2:30pm Wednesday will be ready for pick-upon the following Friday. We can produce limited numbers of hampers, so please get in touch with us to place your order.
                Payment Info: Payments can be made either through our secure payment system which accepts Visa or Mastercard or via PayPal.
                Important Notice: Our products contain traces of nuts and are not suitable for Persons who are allergic to nuts. Brûlée cannot be held responsible for allergic or intolerance reactions. We expect that you have accurately represented the information provided to us on or through our Website (such as your delivery details and times of availability) and that you accept full responsibility for the information provided on or through this Website.  You agree to use your own judgment and due diligence before implementing any idea, suggestion or recommendation from the Website to your life, family or business.  You agree that there are no guarantees as to the specific outcome or results you can expect from using the information you receive on or through this Website.
                Liability information: Although care has been taken in preparing the information provided to you, we cannot be held responsible for any errors or omissions, and we accept no liability whatsoever for any loss or damage you may incur.  We package our bakes as securely as possible, if your products have contactless delivery, we cannot take responsibility for any loss and damage to your products.  

                Here is the customer's query, please respond accordingly and in a nice, casual manner: ${message}
            `,
            max_tokens: 128,
            temperature: 0.2,
        });

        console.log(`AI generated response: ${gptResponse.data.choices[0].text}`)
        return res.status(200).json({
            message: gptResponse.data.choices[0].text
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: err })
    }
})

module.exports = router;