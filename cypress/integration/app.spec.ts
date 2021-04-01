/// <reference types="cypress" />

import faker from "faker";

beforeEach(() => {
    cy.visit("/");
});

it("switches page on inputs change & goes back correctly", () => {
    // query change
    cy.findByRole("textbox", { name: /translation query/i })
        .as("query")
        .type("palabra");
    cy.findByText(/loading translation/i)
        .should("be.visible");
    cy.findByRole("textbox", { name: /translation result/i })
        .as("translation")
        .should("have.value", "word")
        .url()
        .should("include", "/auto/en/palabra");
    // source change
    cy.findByRole("combobox", { name: /source language/i })
        .as("source")
        .select("es")
        .url()
        .should("include", "/es/en/palabra");
    // target change
    cy.findByRole("combobox", { name: /target language/i })
        .as("target")
        .select("ca")
        .get("@translation")
        .should("have.value", "paraula")
        .url()
        .should("include", "/es/ca/palabra");
    // lang switch
    cy.findByRole("button", { name: /switch languages/i })
        .click()
        .get("@source")
        .should("have.value", "ca")
        .get("@target")
        .should("have.value", "es")
        .get("@query")
        .should("have.value", "paraula")
        .get("@translation")
        .should("have.value", "palabra")
        .url()
        .should("include", "/ca/es/paraula");

    // history back
    cy.go("back")
        .get("@translation")
        .should("have.value", "paraula");
    cy.go("back")
        .get("@source")
        .should("have.value", "es")
        .get("@translation")
        .should("have.value", "word");
    cy.go("back")
        .get("@source")
        .should("have.value", "auto")
        .get("@translation")
        .should("have.value", "word");
    cy.go("back")
        .get("@translation")
        .should("be.empty")
        .get("@query")
        .should("be.empty");
});

it("switches first loaded page and back and forth on language change", () => {
    const query = faker.random.words();
    cy.visit(`/auto/en/${query}`);

    cy.findByRole("textbox", { name: /translation query/i })
        .should("have.value", query);
    cy.findByRole("combobox", { name: /source language/i })
        .as("source")
        .select("eo")
        .url()
        .should("include", `/eo/en/${encodeURIComponent(query)}`)
        .get("@source")
        .select("auto")
        .url()
        .should("include", `/auto/en/${encodeURIComponent(query)}`);
});

it("language switching button is disabled on 'auto', but enables when other", () => {
    cy.findByRole("button", { name: /switch languages/i })
        .as("btnSwitch")
        .should("be.disabled");
    cy.findByRole("combobox", { name: /source language/i })
        .as("source")
        .select("eo")
        .get("@btnSwitch")
        .should("be.enabled")
        .click();
    cy.findByRole("combobox", { name: /target language/i })
        .should("have.value", "eo")
        .get("@source")
        .should("have.value", "en")
        .url()
        .should("not.include", "/en")
        .should("not.include", "/eo");
});

it("loads & plays audio correctly", () => {
    const query = faker.lorem.words(5);
    cy.visit(`/la/en/${query}`);

    const play = "Play audio";
    const stop = "Stop audio";

    cy.findAllByRole("button", { name: play })
        .should("be.enabled")
        .click({ multiple: true })
        .should("have.attr", "aria-label", stop)
        .click({ multiple: true })
        .should("have.attr", "aria-label", play)
        .click({ multiple: true })
        .should("have.attr", "aria-label", play)
        .click({ multiple: true })
        .should("have.attr", "aria-label", stop);
});

it("skips to main & toggles color mode", () => {
    cy.findByRole("link", { name: /skip to content/i })
        .focus()
        .click()
        .url()
        .should("include", "#main");

    const white = "rgb(255, 255, 255)";
    cy.get("body")
        .should("have.css", "background-color", white);
    cy.findByRole("button", { name: /toggle color mode/i })
        .as("toggler")
        .click()
        .get("body")
        .should("not.have.css", "background-color", white);
    cy.get("@toggler")
        .click()
        .get("body")
        .should("have.css", "background-color", white);
});
