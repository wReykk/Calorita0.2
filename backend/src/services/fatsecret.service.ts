import axios from 'axios';

let accessToken = '';
let tokenExpiration = 0;

async function getAccessToken(): Promise<string> {
    // Безопасное чтение: переменные читаются в момент вызова функции, 
    // чтобы dotenv точно успел их подгрузить из файла .env
    const CLIENT_ID = process.env.FATSECRET_CLIENT_ID;
    const CLIENT_SECRET = process.env.FATSECRET_CLIENT_SECRET;

    if (accessToken && Date.now() < tokenExpiration) {
        return accessToken;
    }

    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error('❌ Missing FATSECRET_CLIENT_ID or FATSECRET_CLIENT_SECRET in .env');
        throw new Error('FATSECRET_CLIENT_ID and FATSECRET_CLIENT_SECRET are required in .env');
    }

    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64');

    try {
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
        // Забираем 60 секунд для страховки от рассинхрона времени
        tokenExpiration = Date.now() + (response.data.expires_in - 60) * 1000;
        return accessToken;

    } catch (error: any) {
        console.error('❌ FatSecret Token Generation Error:', error.response?.data || error.message);
        throw error;
    }
}

export async function searchProductsInFatSecret(query: string) {
    let token = await getAccessToken();
    let response;

    try {
        response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
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
    } catch (error: any) {
        console.error('❌ FatSecret API HTTP Error:', error.response?.data || error.message);
        return [];
    }

    // 1. ЛОВИМ "ТИХИЕ" ОШИБКИ FATSECRET (внутри ответа 200 OK)
    if (response.data?.error) {
        console.error('❌ FatSecret API Internal Error:', response.data.error);

        // Код 5 означает, что токен инвалид. Делаем одну попытку рефреша.
        if (response.data.error.code === 5 || response.data.error.message?.toLowerCase().includes('token')) {
            console.log('🔄 FatSecret token expired on server side. Refreshing and retrying...');
            accessToken = '';
            tokenExpiration = 0;

            token = await getAccessToken();
            response = await axios.get('https://platform.fatsecret.com/rest/server.api', {
                params: { method: 'foods.search', search_expression: query, format: 'json', max_results: 15 },
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } else {
            // Если это не проблема с токеном, просто прерываем поиск
            return [];
        }
    }

    const foods = response.data?.foods?.food;

    // 2. Если результатов по запросу нет вообще
    if (!foods) {
        return [];
    }

    const foodArray = Array.isArray(foods) ? foods : [foods];

    return foodArray.map((food: any) => {
        const desc = food.food_description || '';

        const getMacro = (regex: RegExp) => {
            const match = desc.match(regex);
            return match ? parseFloat(match[1]) : 0;
        };

        // --- ЛОГИКА ОПРЕДЕЛЕНИЯ ШТУК ---
        let pieceName: string | undefined = undefined;
        const portionMatch = desc.match(/^Per\s+(.*?)\s+-/i);

        if (portionMatch) {
            const portion = portionMatch[1].toLowerCase().trim();
            if (!portion.includes('100g') && !portion.includes('100 g') &&
                !portion.includes('100ml') && !portion.includes('100 ml')) {
                pieceName = portion;
            }
        }
        // ------------------------------------

        return {
            id: food.food_id,
            externalId: food.food_id,
            name: food.food_name,
            calories: getMacro(/Calories:\s*([\d.]+)kcal/i),
            protein: getMacro(/Protein:\s*([\d.]+)g/i),
            fat: getMacro(/Fat:\s*([\d.]+)g/i),
            carbs: getMacro(/Carbs:\s*([\d.]+)g/i),
            description: desc,
            pieceName: pieceName,
            isGlobal: true
        };
    });
}