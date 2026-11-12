// Storage helper functions
function getData() {
    try {
        var data = JSON.parse(localStorage.getItem('urlAnalytics'));
        return Array.isArray(data) ? data : [];
    } catch (e) {
        return [];
    }
}

function saveData(data) {
    localStorage.setItem('urlAnalytics', JSON.stringify(data));
}

// Builds the full short URL from a short code, e.g. https://ef101-link.netlify.app/#k8z2p
function getShortUrl(code) {
    var base = window.location.href.split('#')[0].split('?')[0];
    return base + '#' + code;
}

function shortenUrl() {
    var input = document.getElementById('longUrlInput');
    if (!input) return;
    var longUrl = input.value.trim();

    if (!longUrl) {
        alert('Please enter a valid URL.');
        return;
    }

    // Add https:// if the user left it out, so the redirect works
    if (!/^https?:\/\//i.test(longUrl)) {
        longUrl = 'https://' + longUrl;
    }

    var urlData = getData();
    var shortCode = Math.random().toString(36).substring(2, 7);
    var isMobile = /Mobi|Android/i.test(navigator.userAgent);
    var deviceType = isMobile ? 'Mobile' : 'PC / Desktop';

    var newRecord = {
        code: shortCode,
        originalUrl: longUrl,
        clicks: 0,
        lastClicked: 'Never',
        device: deviceType
    };

    urlData.push(newRecord);
    saveData(urlData);
    renderTable();

    var resultBox = document.getElementById('resultBox');
    var shortLinkDisplay = document.getElementById('shortLinkDisplay');

    if (resultBox && shortLinkDisplay) {
        var shortUrlText = getShortUrl(shortCode);
        shortLinkDisplay.href = shortUrlText;
        shortLinkDisplay.textContent = shortUrlText;
        resultBox.classList.remove('hidden');
    }
    input.value = '';
}

function renderTable() {
    var tbody = document.getElementById('analyticsTableBody');
    if (!tbody) return;
    tbody.innerHTML = '';

    var urlData = getData();
    urlData.forEach(function(item) {
        var tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="p-3"><a href="#" onclick="handleRedirect('${item.code}'); return false;" class="text-blue-600 font-bold">${getShortUrl(item.code)}</a></td>
            <td class="p-3 max-w-xs truncate">${item.originalUrl}</td>
            <td class="p-3">${item.clicks}</td>
            <td class="p-3">${item.lastClicked}</td>
            <td class="p-3">${item.device}</td>
        `;
        tbody.appendChild(tr);
    });
}

function handleRedirect(code) {
    var urlData = getData();
    var record = urlData.find(function(item) {
        return item.code === code;
    });
    if (record) {
        record.clicks += 1;
        record.lastClicked = new Date().toLocaleString();
        saveData(urlData);
        renderTable();
        window.open(record.originalUrl, '_blank');
    }
}

function copyToClipboard() {
    var shortLinkText = document.getElementById('shortLinkDisplay').textContent;
    navigator.clipboard.writeText(shortLinkText);
    alert('Short URL copied to clipboard!');
}

function exportCSV() {
    var urlData = getData();
    if (urlData.length === 0) {
        alert('No data available to export.');
        return;
    }

    var csvContent = 'Short URL,Original URL,Clicks,Last Clicked,Device Used\n';
    urlData.forEach(function(item) {
        csvContent += '"' + getShortUrl(item.code) + '","' + item.originalUrl + '",' + item.clicks + ',"' + item.lastClicked + '","' + item.device + '"\n';
    });

    var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'url_analytics.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

window.onload = function() {
    renderTable();
    var hash = window.location.hash.substring(1);
    if (hash) {
        handleRedirect(hash);
    }
};
