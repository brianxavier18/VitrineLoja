// URL da API (mesma do script.js)
const API_URL = 'https://aurora-atelie-backend.xavierbrian67.workers.dev/api';

// Autenticação Google
async function handleCredentialResponse(response) {
    if (response.credential) {
        try {
            // Verifica no backend se o email é autorizado
            const verifyResponse = await fetch(`${API_URL}/auth/check`, {
                headers: {
                    'Authorization': `Bearer ${response.credential}`
                }
            });

            if (verifyResponse.ok) {
                localStorage.setItem('aurora_admin_token', response.credential);
                checkAuth();
            } else {
                alert("Acesso Negado: Seu email não tem permissão de administrador.");
                localStorage.removeItem('aurora_admin_token');
            }
        } catch (e) {
            console.error(e);
            alert("Erro ao verificar permissões: " + e.message);
        }
    }
}

function logout() {
    localStorage.removeItem('aurora_admin_token');
    location.reload();
}

function checkAuth() {
    const token = localStorage.getItem('aurora_admin_token');
    const loginContainer = document.getElementById('loginContainer');
    const adminContent = document.getElementById('adminContent');
    const logoutBtn = document.getElementById('logoutBtn');

    if (token) {
        loginContainer.style.display = 'none';
        adminContent.style.display = 'block';
        logoutBtn.style.display = 'block';
        loadAdminProducts();
    } else {
        loginContainer.style.display = 'block';
        adminContent.style.display = 'none';
        logoutBtn.style.display = 'none';
    }
}

function getAuthHeaders() {
    const token = localStorage.getItem('aurora_admin_token');
    return {
        'Authorization': `Bearer ${token}`
    };
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    setupForm();

    // Inicializa botão do Google se não estiver logado
    if (!localStorage.getItem('aurora_admin_token')) {
        const interval = setInterval(() => {
            if (window.google && window.google.accounts) {
                clearInterval(interval);
                google.accounts.id.initialize({
                    client_id: "783803410342-360ntp2iimg92v7alfu53oc0et517omh.apps.googleusercontent.com",
                    callback: handleCredentialResponse
                });
                google.accounts.id.renderButton(
                    document.getElementById("googleBtn"),
                    { theme: "outline", size: "large" }
                );
            }
        }, 100);
    }
});

async function loadAdminProducts() {
    const tbody = document.getElementById('productsTableBody');
    tbody.innerHTML = '<tr><td colspan="5">Carregando...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        
        tbody.innerHTML = '';
        products.forEach(product => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><img src="${product.image_url || product.image}" class="preview-image"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>R$ ${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editProduct(${product.id})"><i class="fas fa-edit"></i></button>
                    <button class="action-btn delete-btn" onclick="deleteProduct(${product.id})"><i class="fas fa-trash"></i></button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    } catch (error) {
        console.error(error);
        tbody.innerHTML = '<tr><td colspan="5">Erro ao carregar produtos.</td></tr>';
    }
}

function showAddForm() {
    document.getElementById('productForm').classList.add('active');
    document.getElementById('formTitle').textContent = 'Adicionar Produto';
    document.getElementById('form').reset();
    document.getElementById('productId').value = '';
    document.getElementById('imageUrl').value = '';
    document.getElementById('imagePreview').innerHTML = '';
}

function hideForm() {
    document.getElementById('productForm').classList.remove('active');
}

async function editProduct(id) {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        const product = products.find(p => p.id === id);

        if (product) {
            document.getElementById('productId').value = product.id;
            document.getElementById('name').value = product.name;
            document.getElementById('price').value = product.price;
            document.getElementById('category').value = product.category;
            
            // Handle Image
            const imgUrl = product.image_url || product.image;
            document.getElementById('imageUrl').value = imgUrl;
            if(imgUrl) {
                document.getElementById('imagePreview').innerHTML = `<img src="${imgUrl}" style="height: 100px; border-radius: 4px;">`;
            }

            document.getElementById('description').value = product.description || '';
            
            document.getElementById('formTitle').textContent = 'Editar Produto';
            document.getElementById('productForm').classList.add('active');
            window.scrollTo(0, 0);
        }
    } catch (e) {
        alert("Erro ao carregar detalhes do produto");
    }
}

async function uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            ...getAuthHeaders()
        },
        body: formData
    });

    if (response.status === 401) {
        alert("Sessão expirada ou não autorizada.");
        logout();
        throw new Error("Unauthorized");
    }

    if (!response.ok) throw new Error('Falha no upload da imagem');
    const data = await response.json();
    return data.url;
}

function setupForm() {
    document.getElementById('form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Salvando...';
        submitBtn.disabled = true;

        try {
            let finalImageUrl = document.getElementById('imageUrl').value;
            const fileInput = document.getElementById('imageFile');
            
            // Se houver arquivo novo, faz upload
            if (fileInput.files.length > 0) {
                finalImageUrl = await uploadImage(fileInput.files[0]);
            }

            const id = document.getElementById('productId').value;
            const data = {
                name: document.getElementById('name').value,
                price: parseFloat(document.getElementById('price').value),
                category: document.getElementById('category').value,
                image_url: finalImageUrl,
                description: document.getElementById('description').value
            };

            const method = id ? 'PUT' : 'POST';
            const url = id ? `${API_URL}/products/${id}` : `${API_URL}/products`;

            const response = await fetch(url, {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    ...getAuthHeaders()
                },
                body: JSON.stringify(data)
            });

            if (response.status === 401) {
                alert("Sessão expirada ou não autorizada.");
                logout();
                return;
            }

            if (response.ok) {
                alert('Produto salvo com sucesso!');
                hideForm();
                loadAdminProducts();
            } else {
                alert('Erro ao salvar produto.');
            }
        } catch (error) {
            console.error(error);
            alert('Erro: ' + error.message);
        } finally {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    });
}

async function deleteProduct(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders()
            }
        });

        if (response.status === 401) {
            alert("Sessão expirada ou não autorizada.");
            logout();
            return;
        }

        if (response.ok) {
            loadAdminProducts();
        } else {
            alert('Erro ao excluir produto.');
        }
    } catch (error) {
        alert('Erro de conexão.');
    }
}

// Expor para o escopo global
window.handleCredentialResponse = handleCredentialResponse;
window.logout = logout;
