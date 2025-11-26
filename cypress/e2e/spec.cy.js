describe('check of the protected route works (projects)', () => {
  it('redirects the user to login when not authenticated', () => {
    cy.visit('/projects');
    cy.url().should('include', '/login');
  })
});

describe("Login works", () => {
  it("logs the user in", () => {
    cy.visit("/login");
    cy.get('input[name="email"]').type("lhamilton@f1.com");
    cy.get('input[name="password"]').type("123456");
    cy.get('button[type="submit"]').click();
    cy.url().should("include", "/");
  })
})

describe('user logout works', () => {
  it('user logout', function () {
    cy.visit('http://localhost:3000')
    cy.get('#root a[href="/login"]').click();
    cy.get('[name="email"]').click();
    cy.get('[name="email"]').type('lhamilton@f1.com');
    cy.get('[name="password"]').type('123456');
    cy.get('#root button.btn').click();
    cy.get('#root button.btn').click();
    // localhost storage should not have token and username
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('username')).to.be.null;
    });
  });
});
