// js/utils.js — XSS koruması için HTML kaçış
function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

window.escapeHtml = escapeHtml;

function getAuthHeaders() {
    const token = localStorage.getItem('kavrulmus_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
}

window.getAuthHeaders = getAuthHeaders;
