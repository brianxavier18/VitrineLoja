document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
    setupFilters();
    setupNewsletter();
});

// URL da API (será atualizada após o deploy do Worker)
const API_URL = 'https://aurora-atelie-backend.xavierbrian67.workers.dev/api'; // Prod URL

async function loadProducts(category = 'all') {
    const container = document.getElementById('products-container');
    container.innerHTML = '<div class="loading">Carregando joias...</div>';

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        const filteredProducts = category === 'all' 
            ? products 
            : products.filter(p => p.category === category);

        displayProducts(filteredProducts);
    } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        container.innerHTML = '<div class="error">Erro ao carregar a coleção. Tente novamente.</div>';
    }
}

function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<div class="no-products">Nenhuma joia encontrada nesta categoria.</div>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        // Usa image_url do banco ou fallback
        const imgUrl = product.image_url || product.image || 'https://placehold.co/300x300/f9f7f2/d4af37?text=Sem+Imagem';
        
        card.innerHTML = `
            <img src="${imgUrl}" alt="${product.name}" class="product-image">
            <h3 class="product-name">${product.name}</h3>
            <p class="product-price">R$ ${parseFloat(product.price).toFixed(2)}</p>
        `;
        container.appendChild(card);
    });
}

function setupFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            buttons.forEach(b => b.classList.remove('active'));
            // Add active to clicked
            btn.classList.add('active');
            
            const filter = btn.getAttribute('data-filter');
            loadProducts(filter);
        });
    });
}

function setupNewsletter() {
    const form = document.getElementById('newsletter-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = form.querySelector('input').value;
        alert(`Obrigado! Você será avisada sobre novidades em: ${email}`);
        form.reset();
    });
}

// Mock Data Generator
function getMockProducts() {
    return [
        { id: 1, name: 'Brinco Pérola Real', category: 'brincos', price: 299.90, image: 'https://placehold.co/300x300/f9f7f2/d4af37?text=Brinco+Perola' },
        { id: 2, name: 'Colar Gota de Ouro', category: 'colares', price: 450.00, image: 'https://placehold.co/300x300/f9f7f2/d4af37?text=Colar+Ouro' },
        { id: 3, name: 'Conjunto Noite Estrelada', category: 'conjuntos', price: 1200.00, image: 'https://placehold.co/300x300/1a1a1a/d4af37?text=Conjunto+Noite' },
        { id: 4, name: 'Brinco Argola Diamante', category: 'brincos', price: 890.00, image: 'https://placehold.co/300x300/f9f7f2/d4af37?text=Argola+Diamante' },
        { id: 5, name: 'Colar Riviera', category: 'colares', price: 1500.00, image: 'https://placehold.co/300x300/f9f7f2/d4af37?text=Colar+Riviera' },
        { id: 6, name: 'Conjunto Clássico', category: 'conjuntos', price: 980.00, image: 'https://placehold.co/300x300/f9f7f2/d4af37?text=Conjunto+Classico' },
    ];
}
