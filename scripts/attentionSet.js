(() => {
    const embedIds = {
        1: 'IMKAK3iJB0Q?si=LuBc4_Tl_Z3DgfZp',
        2: 'SuK5LUWj9do?si=G7JjfQP7vVKOZKH5',
        3: 'ZF4DA2MEVqM?si=TsNe07wvXPQgGE0T'
    }
    let eplayer = document.getElementById("eplayer_iframe");

    if (eplayer) {
        const videoContainer = eplayer.contentWindow.document.getElementById("main-video-container").parentElement

        videoContainer.style.display = "grid";
        videoContainer.style.gridTemplateColumns = "5fr 1fr";

        let node = eplayer.contentWindow.document.getElementById("attention-lock-container")

        if (!node) {
            node = document.createElement("div")
            node.id = "attention-lock-container"
        }

        node.innerHTML = `
            <iframe class="youtube-video" src="https://www.youtube.com/embed/${embedIds[self.attentionVideoId]}&amp;controls=1&amp;disablekb=1&amp;fs=0&amp;iv_load_policy=3&amp;loop=1&amp;autoplay=1;&amp;playlist=IMKAK3iJB0Q" 
                title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen="" 
                style="
                    aspect-ratio: 1/2;
                    height: 100%;">
            </iframe>
        `

        videoContainer.appendChild(node)
    }
})()
