import axios from 'axios';

const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

let accessToken = '';
let tokenExpiration = 0;

async function getAccessToken(): Promise<string> {
    if (accessToken && Date.now() < tokenExpiration) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        throw new Error('FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET are required in .env');
    }

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    const response = await axios.post(
        'https://oauth.fatsecret.com/connect/token',
        'grant_type=client_credentials&scope=basic',
        {
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );

    accessToken = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;

    return accessToken;
}

export async function searchProductsInFatSecret(query: string) {
    const token = await getAccessToken();

    const response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
        params: {
            method: 'foods.search',
            search_expression: query,
            format: 'json',
            max_results: 15
        },
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });

    console.log("FATSECRET RAW DATA:", JSON.stringify(response.data, null, 2));

    const foods = response.data?.foods?.food;
    if (!foods) return [];

    const foodArray = Array.isArray(foods) ? foods : [foods];

    return foodArray.map((food: any) => {
        const desc = food.food_description;

        const getMacro = (regex: RegExp) => {
            const match = desc.match(regex);
            return match ? parseFloat(match[1]) : 0;
        };

        return {
            externalId: food.food_id,
            name: food.food_name,
            calories: getMacro(/Calories:\s*(\d+)kcal/i),
            protein: getMacro(/Protein:\s*([\d.]+)g/i),
            fat: getMacro(/Fat:\s*([\d.]+)g/i),
            carbs: getMacro(/Carbs:\s*([\d.]+)g/i),
            description: desc,
            isGlobal: true
        };
    });
}