// ========================================================
// PORTFOLIO DATA
// ========================================================

let portfolioData = null;


// ========================================================
// GET DATA FROM FLASK BACKEND
// ========================================================

async function getData() {

    const response =
        await fetch("/api/portfolio");

    if (!response.ok) {

        throw new Error(
            "Could not load portfolio data"
        );

    }

    return await response.json();
}


// ========================================================
// SAVE DATA TO FLASK BACKEND
// ADMIN ONLY
// ========================================================

async function saveData(data) {

    const response =
        await fetch(
            "/api/portfolio",
            {
                method: "PUT",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify(data)
            }
        );


    if (response.status === 401) {

        alert(
            "Your admin session has expired. Please login again."
        );

        window.location.href = "/admin";

        return false;
    }


    if (!response.ok) {

        alert(
            "Something went wrong while saving."
        );

        return false;
    }


    return true;
}


// ========================================================
// ESCAPE HTML
// ========================================================

function escapeHTML(str) {

    return String(str).replace(
        /[&<>"']/g,

        m => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[m])
    );
}


// ========================================================
// RENDER PORTFOLIO
// ========================================================

async function renderPortfolio() {

    try {

        const d = await getData();

        portfolioData = d;


        // ABOUT

        const about =
            document.getElementById(
                "aboutText"
            );

        if (about)
            about.textContent = d.about;


        // DSA

        const solved =
            document.getElementById(
                "dsaSolved"
            );

        const completion =
            document.getElementById(
                "dsaCompletion"
            );

        const topics =
            document.getElementById(
                "dsaTopics"
            );


        if (solved)
            solved.textContent =
                d.dsaSolved;


        if (completion)
            completion.textContent =
                d.dsaCompletion + "%";


        if (topics)
            topics.textContent =
                d.dsaTopics;


        // ACHIEVEMENTS

        const achievements =
            document.getElementById(
                "achievementsList"
            );


        if (achievements) {

            achievements.innerHTML =
                d.achievements
                .map(
                    a => `

                    <div class="card">

                        <h3>
                            🏆
                            ${escapeHTML(a.title)}
                        </h3>

                        <p>
                            ${escapeHTML(a.description)}
                        </p>

                    </div>

                    `
                )
                .join("");

        }


        // CERTIFICATIONS

        const certs =
            document.getElementById(
                "certificationsList"
            );


        if (certs) {

            if (d.certifications.length) {

                certs.innerHTML =
                    d.certifications
                    .map(
                        c => `

                        <div class="card">

                            <h3>
                                📜
                                ${escapeHTML(c.name)}
                            </h3>

                            <p>
                                ${escapeHTML(c.platform)}
                                •
                                ${escapeHTML(c.date)}
                            </p>

                            ${
                                c.link
                                ?
                                `
                                <a
                                    class="cert-link"
                                    href="${escapeHTML(c.link)}"
                                    target="_blank"
                                >
                                    View Certificate ↗
                                </a>
                                `
                                :
                                ""
                            }

                        </div>

                        `
                    )
                    .join("");

            }

            else {

                certs.innerHTML = `

                    <div class="card">

                        <h3>
                            📜 No certifications added yet
                        </h3>

                        <p>
                            Add your first certification
                            from the Admin page.
                        </p>

                    </div>

                `;

            }

        }


        // JOURNEY

        const journey =
            document.getElementById(
                "journeyList"
            );


        if (journey) {

            journey.innerHTML =
                d.journey
                .map(
                    j => `

                    <div class="timeline-item">

                        <h3>
                            ${escapeHTML(j.title)}
                        </h3>

                        <p>
                            ${escapeHTML(j.description)}
                        </p>

                    </div>

                    `
                )
                .join("");

        }


        // SKILLS

        const skills =
            document.getElementById(
                "skillsProgress"
            );


        if (skills) {

            skills.innerHTML =
                d.skills
                .map(
                    s => `

                    <div class="skill">

                        <div class="skill-name">

                            ${escapeHTML(s[0])}
                            —
                            ${s[1]}%

                        </div>

                        <div class="bar">

                            <div
                                class="progress"
                                style="width:${Number(s[1])}%"
                            ></div>

                        </div>

                    </div>

                    `
                )
                .join("");

        }

    }

    catch (error) {

        console.error(error);

    }

}


// ========================================================
// ADMIN PANEL
// ========================================================

async function loadAdmin() {

    const d = await getData();

    portfolioData = d;


    document.getElementById(
        "solved"
    ).value = d.dsaSolved;


    document.getElementById(
        "completion"
    ).value = d.dsaCompletion;


    document.getElementById(
        "topics"
    ).value = d.dsaTopics;


    document.getElementById(
        "about"
    ).value = d.about;


    // SKILLS

    document.getElementById(
        "skillInputs"
    ).innerHTML =

        d.skills.map(

            (s, i) => `

                <div>

                    <label>
                        ${escapeHTML(s[0])}
                    </label>

                    <input
                        class="skillInput"
                        data-index="${i}"
                        type="number"
                        min="0"
                        max="100"
                        value="${s[1]}"
                    >

                </div>

            `
        ).join("");


    renderItems();


    // DASHBOARD NUMBERS

    const solved =
        document.getElementById(
            "dashboardSolved"
        );

    const completion =
        document.getElementById(
            "dashboardCompletion"
        );

    const achievements =
        document.getElementById(
            "dashboardAchievements"
        );

    const certifications =
        document.getElementById(
            "dashboardCertifications"
        );


    if (solved)
        solved.textContent =
            d.dsaSolved;


    if (completion)
        completion.textContent =
            d.dsaCompletion + "%";


    if (achievements)
        achievements.textContent =
            d.achievements.length;


    if (certifications)
        certifications.textContent =
            d.certifications.length;

}


// ========================================================
// UPDATE DSA
// ========================================================

async function updateDSA() {

    const d = await getData();


    d.dsaSolved =
        Number(
            document.getElementById(
                "solved"
            ).value
        );


    d.dsaCompletion =
        Math.max(
            0,
            Math.min(
                100,
                Number(
                    document.getElementById(
                        "completion"
                    ).value
                )
            )
        );


    d.dsaTopics =
        document.getElementById(
            "topics"
        ).value;


    if (await saveData(d)) {

        alert(
            "✅ DSA progress updated!"
        );

        loadAdmin();

    }

}


// ========================================================
// UPDATE ABOUT
// ========================================================

async function updateAbout() {

    const d = await getData();


    d.about =
        document.getElementById(
            "about"
        ).value;


    if (await saveData(d)) {

        alert(
            "✅ About section updated!"
        );

    }

}


// ========================================================
// ADD ACHIEVEMENT
// ========================================================

async function addAchievement() {

    const d = await getData();


    const title =
        document.getElementById(
            "achievementTitle"
        );


    const description =
        document.getElementById(
            "achievementDescription"
        );


    if (!title.value.trim()) {

        alert(
            "Enter an achievement title."
        );

        return;

    }


    d.achievements.push({

        title: title.value,

        description:
            description.value

    });


    if (await saveData(d)) {

        title.value = "";

        description.value = "";

        renderItems();

        loadAdmin();

        alert(
            "🏆 Achievement added!"
        );

    }

}


// ========================================================
// ADD CERTIFICATION
// ========================================================

async function addCertification() {

    const d = await getData();


    const name =
        document.getElementById(
            "certName"
        );


    const platform =
        document.getElementById(
            "certPlatform"
        );


    const date =
        document.getElementById(
            "certDate"
        );


    const link =
        document.getElementById(
            "certLink"
        );


    if (!name.value.trim()) {

        alert(
            "Enter a certification name."
        );

        return;

    }


    d.certifications.push({

        name: name.value,

        platform: platform.value,

        date: date.value,

        link: link.value

    });


    if (await saveData(d)) {

        name.value = "";

        platform.value = "";

        date.value = "";

        link.value = "";

        renderItems();

        loadAdmin();

        alert(
            "📜 Certification added!"
        );

    }

}


// ========================================================
// ADD JOURNEY
// ========================================================

async function addJourney() {

    const d = await getData();


    const title =
        document.getElementById(
            "journeyTitle"
        );


    const description =
        document.getElementById(
            "journeyDescription"
        );


    if (!title.value.trim()) {

        alert(
            "Enter a milestone title."
        );

        return;

    }


    d.journey.push({

        title: title.value,

        description:
            description.value

    });


    if (await saveData(d)) {

        title.value = "";

        description.value = "";

        renderItems();

        loadAdmin();

        alert(
            "🚀 Journey milestone added!"
        );

    }

}


// ========================================================
// UPDATE SKILLS
// ========================================================

async function updateSkills() {

    const d = await getData();


    document
        .querySelectorAll(
            ".skillInput"
        )
        .forEach(input => {

            const index =
                input.dataset.index;


            d.skills[index][1] =
                Math.max(
                    0,
                    Math.min(
                        100,
                        Number(input.value)
                    )
                );

        });


    if (await saveData(d)) {

        alert(
            "💻 Skills updated!"
        );

        loadAdmin();

    }

}


// ========================================================
// DELETE ACHIEVEMENT
// ========================================================

async function removeAchievement(i) {

    const d = await getData();

    d.achievements.splice(i, 1);

    if (await saveData(d)) {

        renderItems();

        loadAdmin();

    }

}


// ========================================================
// DELETE CERTIFICATION
// ========================================================

async function removeCertification(i) {

    const d = await getData();

    d.certifications.splice(i, 1);

    if (await saveData(d)) {

        renderItems();

        loadAdmin();

    }

}


// ========================================================
// DELETE JOURNEY
// ========================================================

async function removeJourney(i) {

    const d = await getData();

    d.journey.splice(i, 1);

    if (await saveData(d)) {

        renderItems();

        loadAdmin();

    }

}


// ========================================================
// DISPLAY EXISTING ITEMS
// ========================================================

async function renderItems() {

    const d = await getData();


    const achievements =
        document.getElementById(
            "achievementItems"
        );


    const certs =
        document.getElementById(
            "certItems"
        );


    const journey =
        document.getElementById(
            "journeyItems"
        );


    if (achievements) {

        achievements.innerHTML =
            d.achievements
            .map(
                (a, i) => `

                <div class="item">

                    <b>
                        🏆
                        ${escapeHTML(a.title)}
                    </b>

                    <p>
                        ${escapeHTML(a.description)}
                    </p>

                    <button
                        class="danger"
                        onclick="removeAchievement(${i})"
                    >
                        Delete
                    </button>

                </div>

                `
            )
            .join("");

    }


    if (certs) {

        certs.innerHTML =
            d.certifications
            .map(
                (c, i) => `

                <div class="item">

                    <b>
                        📜
                        ${escapeHTML(c.name)}
                    </b>

                    <p>
                        ${escapeHTML(c.platform)}
                        •
                        ${escapeHTML(c.date)}
                    </p>

                    <button
                        class="danger"
                        onclick="removeCertification(${i})"
                    >
                        Delete
                    </button>

                </div>

                `
            )
            .join("");

    }


    if (journey) {

        journey.innerHTML =
            d.journey
            .map(
                (j, i) => `

                <div class="item">

                    <b>
                        ${escapeHTML(j.title)}
                    </b>

                    <p>
                        ${escapeHTML(j.description)}
                    </p>

                    <button
                        class="danger"
                        onclick="removeJourney(${i})"
                    >
                        Delete
                    </button>

                </div>

                `
            )
            .join("");

    }

}


// ========================================================
// RESET DATA
// ========================================================

async function resetData() {

    if (
        !confirm(
            "Reset all portfolio data?"
        )
    ) {

        return;

    }


    // This version resets by deleting
    // the database and recreating it.

    const response =
        await fetch(
            "/api/reset",
            {
                method: "POST"
            }
        );


    if (response.ok) {

        alert(
            "Portfolio reset."
        );

        loadAdmin();

    }

}


// ========================================================
// PAGE DETECTION
// ========================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        // Portfolio page

        if (
            document.getElementById(
                "aboutText"
            )
        ) {

            renderPortfolio();

        }


        // Admin page

        if (
            document.getElementById(
                "solved"
            )
        ) {

            loadAdmin();

        }

    }
);
