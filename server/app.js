require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors({
    origin: "http://127.0.0.1:5500"
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log(process.env.CLIENT_URL);
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const storeItems = new Map([
    [1, { priceInPaise: 1000, name: "Buy Self Medicine"}],
    [2, { priceInPaise: 5000, name: "BP checker"}]
])

app.get("/create-checkout-session", async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            data: {}
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message,
            data: {}
        })
    }
})
app.post("/create-checkout-session", async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment",
            line_items: req.body.items.map(item => {
                const storeItem = storeItems.get(item.id)
                return {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: storeItem.name
                        },
                        unit_amount: storeItem.priceInPaise
                    },
                    quantity: item.quantity
                }
            }),
            success_url: `${process.env.CLIENT_URL}/client/success.html`,
            cancel_url: `${process.env.CLIENT_URL}/client/cancel.html`
        })
        res.json({ url: session.url })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.listen(3000, () => {
    console.log("server started on 3000 ")
});