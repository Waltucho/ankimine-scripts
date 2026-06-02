(function() {
    // 1. Get the highlighted word from the extension
    const targetWord = window.ankimineSelectedText || ""; 
    if (!targetWord) return "Nenhum texto selecionado.";

    // 2. Locate the main Portuguese content section on Wiktionary
    // We isolate the core definition content and strip out Wikipedia sidebars
    const content = document.querySelector('#mw-content-text .mw-parser-output');
    if (!content) return "Definição não encontrada.";

    // Clone the node so we can clean it safely
    const container = content.cloneNode(true);

    // 3. Extract the IPA Pronunciation
    const ipaElement = container.querySelector('.subhead, .ipa, .fone');
    let ipaHtml = '';
    if (ipaElement) {
        ipaHtml = `<div style="color: #666; font-size: 0.9em; margin-bottom: 10px;">
                    🗣️ [${ipaElement.innerText.trim()}]
                   </div>`;
    }

    // 4. Gather the definitions, tags, and examples
    // Wiktionary stores speech parts in headings/lists (ol, ul, p)
    const lists = container.querySelectorAll('ol, ul');
    let definitionHtml = '';

    lists.forEach((list) => {
        // Find the word classification right before this list (e.g., Substantivo, Adjetivo)
        let header = list.previousElementSibling;
        while (header && !['H3', 'H4', 'P'].includes(header.tagName)) {
            header = header.previousElementSibling;
        }
        
        let tagText = header ? header.innerText.replace('[editar]', '').trim() : 'definição';
        
        // Skip irrelevant sections like "Etimologia" or "Pronúncia"
        if (!['Etimologia', 'Pronúncia', 'Ver também', 'Referências'].includes(tagText)) {
            definitionHtml += `
                <div style="border: 1px solid #e0e0e0; border-radius: 6px; padding: 12px; margin-bottom: 12px; font-family: sans-serif;">
                    <span style="background-color: #0b57d0; color: white; padding: 2px 6px; border-radius: 4px; font-size: 0.8em; font-weight: bold; text-transform: lowercase;">
                        ${tagText}
                    </span>
                    <div style="margin-top: 8px; color: #1f1f1f; line-height: 1.5;">
                        ${list.innerHTML}
                    </div>
                </div>`;
        }
    });

    // 5. Fallback if structured lists aren't found
    if (!definitionHtml) {
        const paragraphs = container.querySelectorAll('p');
        paragraphs.forEach(p => {
            if (p.innerText.trim().length > 10) {
                definitionHtml += `<p style="line-height: 1.5; color: #1f1f1f;">${p.innerHTML}</p>`;
            }
        });
    }

    // Combine everything into a clean card layout matching image_b8f524.png
    return `
        <div style="text-align: left; max-width: 100%;">
            <h2 style="margin-bottom: 4px; color: #111;">${targetWord}</h2>
            ${ipaHtml}
            <hr style="border: 0; border-top: 1px solid #ccc; margin-bottom: 12px;">
            ${definitionHtml || "Não foi possível estruturar a definição."}
        </div>
    `;
})();