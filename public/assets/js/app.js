// App glue to render tickets page UI without a framework.
import {
  fetchTickets,
  createTicket,
  updateTicket,
  deleteTicket,
} from "./tickets.js";
import { isAuthenticated, logout, login } from "./auth.js";
import { show as toast } from "./toast.js";

function createEl(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const k in attrs) {
    if (k === "class") el.className = attrs[k];
    else if (k.startsWith("on") && typeof attrs[k] === "function")
      el.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
    else el.setAttribute(k, attrs[k]);
  }
  children.flat().forEach((c) => {
    if (typeof c === "string") el.appendChild(document.createTextNode(c));
    else if (c instanceof Node) el.appendChild(c);
  });
  return el;
}

// ... render form, tickets list, modal, toast similar to React app
async function initTicketsPage() {
  const formContainer = document.getElementById("ticket-form-container");
  const listContainer = document.getElementById("tickets-list");

  let tickets = await fetchTickets();
  let isLoading = false;

  function renderList() {
    listContainer.innerHTML = "";
    if (isLoading) {
      listContainer.textContent = "Loading...";
      return;
    }
    tickets.forEach((t) => listContainer.appendChild(renderCard(t)));
  }

  function renderCard(ticket) {
    const statusStyles = {
      open: "bg-green-100 text-green-800",
      in_progress: "bg-amber-100 text-amber-800",
      closed: "bg-gray-100 text-gray-700",
    };
    const card = createEl(
      "article",
      {
        class:
          "bg-white dark:bg-gray-800 rounded-lg shadow p-4 hover:shadow-md transition",
      },
      createEl(
        "div",
        { class: "flex items-start justify-between gap-4" },
        createEl(
          "div",
          {},
          createEl("h4", { class: "font-semibold text-lg" }, ticket.title),
          createEl(
            "p",
            { class: "text-sm text-gray-500 dark:text-gray-400 mt-1" },
            ticket.description || "No description"
          )
        ),
        createEl(
          "div",
          { class: "text-right" },
          createEl(
            "div",
            {
              class: `inline-flex items-center px-3 py-1 rounded text-xs font-medium ${
                statusStyles[ticket.status] || statusStyles.open
              }`,
            },
            ticket.status.replace("_", " ")
          )
          // priority display removed
        )
      ),
      createEl(
        "div",
        { class: "mt-4 flex gap-2" },
        createEl(
          "button",
          {
            class: "px-3 py-1 bg-indigo-600 text-white rounded text-sm",
            onClick: () => openEdit(ticket),
          },
          "Edit"
        ),
        createEl(
          "button",
          {
            class: "px-3 py-1 bg-red-600 text-white rounded text-sm",
            onClick: () => openDeleteConfirm(ticket),
          },
          "Delete"
        )
      )
    );
    return card;
  }

  // form state
  let editing = null;
  let form = { title: "", description: "", status: "open" };
  let errors = {};
  let confirm = { open: false, ticket: null };

  function setFormState(next) {
    form = { ...form, ...next };
    renderForm();
  }

  function renderForm() {
    formContainer.innerHTML = "";
    const card = createEl(
      "div",
      { class: "mb-6 bg-white dark:bg-gray-800 rounded-lg shadow p-6" },
      createEl(
        "h3",
        { class: "text-lg font-semibold mb-2" },
        editing ? "Edit ticket" : "Create ticket"
      ),
      createEl(
        "form",
        { onSubmit: onSubmit, class: "grid grid-cols-1 md:grid-cols-3 gap-4" },
        createEl(
          "div",
          { class: "md:col-span-2" },
          createEl("label", { class: "block text-sm" }, "Title"),
          createEl("input", {
            value: form.title,
            name: "title",
            class: "mt-1 w-full px-3 py-2 rounded border",
            onChange: (e) => setFormState({ title: e.target.value }),
          }),
          errors.title
            ? createEl(
                "div",
                { class: "text-xs text-red-600 mt-1" },
                errors.title
              )
            : ""
        ),
        createEl(
          "div",
          {},
          createEl("label", { class: "block text-sm" }, "Status"),
          (function () {
            const sel = createEl(
              "select",
              {
                class: "mt-1 w-full px-3 py-2 rounded border",
                name: "status",
                onChange: (e) => setFormState({ status: e.target.value }),
              },
              createEl("option", { value: "open" }, "open"),
              createEl("option", { value: "in_progress" }, "in_progress"),
              createEl("option", { value: "closed" }, "closed")
            );
            sel.value = form.status;
            return sel;
          })(),
          errors.status
            ? createEl(
                "div",
                { class: "text-xs text-red-600 mt-1" },
                errors.status
              )
            : ""
        ),
        createEl(
          "div",
          { class: "md:col-span-3" },
          createEl(
            "label",
            { class: "block text-sm" },
            "Description ",
            createEl("span", { class: "text-xs text-gray-400" }, "(optional)")
          ),
          createEl(
            "textarea",
            {
              class: "mt-1 w-full px-3 py-2 rounded border",
              rows: 3,
              onChange: (e) => setFormState({ description: e.target.value }),
            },
            form.description
          ),
          errors.description
            ? createEl(
                "div",
                { class: "text-xs text-red-600 mt-1" },
                errors.description
              )
            : ""
        ),

        createEl(
          "div",
          { class: "flex items-end gap-2" },
          createEl(
            "button",
            {
              type: "submit",
              class: "px-4 py-2 bg-indigo-600 text-white rounded",
            },
            editing ? "Update" : "Create"
          ),
          createEl(
            "button",
            {
              type: "button",
              class: "px-4 py-2 border rounded",
              onClick: openCreate,
            },
            "Reset"
          )
        )
      )
    );
    formContainer.appendChild(card);
  }

  function openCreate() {
    editing = null;
    form = { title: "", description: "", status: "open" };
    errors = {};
    renderForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEdit(ticket) {
    editing = ticket;
    form = { ...ticket };
    errors = {};
    renderForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDeleteConfirm(ticket) {
    confirm = { open: true, ticket };
    renderConfirm();
  }

  function renderConfirm() {
    const modalRoot = document.getElementById("modal-root");
    modalRoot.innerHTML = "";
    if (!confirm.open) return;
    const modal = createEl(
      "div",
      { class: "fixed inset-0 bg-black/50 flex items-center justify-center" },
      createEl(
        "div",
        { class: "bg-white dark:bg-gray-800 rounded p-6 w-full max-w-md" },
        createEl(
          "h3",
          { class: "text-lg font-semibold mb-2" },
          "Confirm delete"
        ),
        createEl(
          "p",
          {},
          "Are you sure you want to delete ",
          createEl("strong", {}, confirm.ticket.title),
          "?"
        ),
        createEl(
          "div",
          { class: "mt-4 flex gap-2" },
          createEl(
            "button",
            {
              class: "px-4 py-2 bg-red-600 text-white rounded",
              onClick: async () => {
                try {
                  await deleteTicket(confirm.ticket);
                  tickets = await fetchTickets();
                  renderList();
                  toast({ message: "Ticket deleted", type: "success" });
                } catch (e) {
                  toast({ message: "Failed to delete ticket", type: "error" });
                }
                confirm = { open: false, ticket: null };
                renderConfirm();
              },
            },
            "Delete"
          ),
          createEl(
            "button",
            {
              class: "px-4 py-2 border rounded",
              onClick: () => {
                confirm = { open: false, ticket: null };
                renderConfirm();
              },
            },
            "Cancel"
          )
        )
      )
    );
    modalRoot.appendChild(modal);
  }

  async function onSubmit(e) {
    e.preventDefault();
    const eobj = {};
    if (!form.title) eobj.title = "Title is required";
    if (!form.status) eobj.status = "Status is required";
    const allowed = ["open", "in_progress", "closed"];
    if (form.status && !allowed.includes(form.status))
      eobj.status = "Invalid status";
    if (form.description && form.description.length > 1000)
      eobj.description = "Description is too long (max 1000 chars)";
    // priority field removed from form
    errors = eobj;
    if (Object.keys(eobj).length > 0) {
      renderForm();
      const first = Object.keys(eobj)[0];
      const el = document.querySelector(`[name="${first}"]`);
      if (el) el.focus();
      return;
    }
    if (editing) {
      try {
        await updateTicket(form);
        tickets = await fetchTickets();
        renderList();
        toast({ message: "Ticket updated", type: "success" });
        editing = null;
      } catch (e) {
        toast({ message: "Failed to update ticket", type: "error" });
      }
    } else {
      try {
        await createTicket(form);
        tickets = await fetchTickets();
        renderList();
        toast({ message: "Ticket created", type: "success" });
      } catch (e) {
        toast({ message: "Failed to create ticket", type: "error" });
      }
    }
    form = { title: "", description: "", status: "open" };
    renderForm();
  }

  // initial render
  renderForm();
  renderList();
}

// Initialize when on tickets page
if (document.getElementById("tickets-list")) {
  initTicketsPage();
}

// render auth actions in header
function renderAuthActions() {
  const root = document.getElementById("auth-actions");
  if (!root) return;
  root.innerHTML = "";
  if (!isAuthenticated()) {
    root.appendChild(
      createEl(
        "a",
        {
          href: "/auth/login",
          class: "px-4 py-2 rounded bg-indigo-600 text-white hover:opacity-95",
        },
        "Login"
      )
    );
    root.appendChild(
      createEl(
        "a",
        {
          href: "/auth/signup",
          class:
            "ml-2 px-4 py-2 rounded border border-indigo-600 text-indigo-600 hover:bg-indigo-50",
        },
        "Get Started"
      )
    );
  } else {
    root.appendChild(
      createEl(
        "button",
        {
          class: "px-4 py-2 rounded bg-red-600 text-white hover:opacity-95",
          onClick: () => {
            logout();
            window.location = "/";
          },
        },
        "Logout"
      )
    );
  }
}
renderAuthActions();

// client-side protected-route guard for Twig pages (mirrors React ProtectedRoute)
(() => {
  const p = window.location.pathname;
  const protectedPaths = ["/tickets", "/dashboard"];
  if (protectedPaths.includes(p) && !isAuthenticated()) {
    toast({
      message: "Please log in to access this page.",
      type: "error",
      duration: 1800,
    });
    setTimeout(() => (window.location = "/auth/login"), 700);
  }
})();

// wire login / signup forms (client-side demo auth)
function initAuthForms() {
  function setFieldError(form, name, msg) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return;
    let err = el.nextElementSibling;
    // if next sibling isn't our error node, create one
    if (!err || !err.classList || !err.classList.contains("auth-field-error")) {
      err = document.createElement("div");
      err.className = "text-xs text-red-600 mt-1 auth-field-error";
      el.after(err);
    }
    err.textContent = msg;
  }

  function clearFieldError(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    if (!el) return;
    const err = el.nextElementSibling;
    if (err && err.classList && err.classList.contains("auth-field-error")) {
      err.textContent = "";
    }
  }

  function setSubmitting(form, isSubmitting, txt) {
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    btn.disabled = !!isSubmitting;
    if (isSubmitting) {
      btn.dataset.orig = btn.textContent;
      btn.textContent = txt || "Please wait...";
      btn.classList.add("opacity-60", "cursor-not-allowed");
    } else {
      if (btn.dataset.orig) btn.textContent = btn.dataset.orig;
      btn.classList.remove("opacity-60", "cursor-not-allowed");
    }
  }

  function flashMessage(msg, type = "success") {
    // delegate to toast module for consistent UX
    toast({
      message: msg,
      type: type === "error" ? "error" : "success",
      duration: 2000,
    });
  }

  const loginForm = document.querySelector('form[data-auth="login"]');
  if (loginForm) {
    // clear errors on input
    loginForm.addEventListener("input", (e) => {
      if (e.target && e.target.name) clearFieldError(loginForm, e.target.name);
    });

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailEl = loginForm.querySelector('input[name="email"]');
      const passwordEl = loginForm.querySelector('input[name="password"]');
      const email = emailEl ? emailEl.value.trim() : "";
      const password = passwordEl ? passwordEl.value : "";
      // simple validation
      let hasErr = false;
      if (!email) {
        setFieldError(loginForm, "email", "Email is required");
        hasErr = true;
      }
      if (!password) {
        setFieldError(loginForm, "password", "Password is required");
        hasErr = true;
      }
      if (hasErr) return;

      setSubmitting(loginForm, true, "Signing in...");
      try {
        // demo: no server auth, persist a simple user object
        login({ id: email, name: email.split("@")[0] || email });
        renderAuthActions();
        flashMessage("Signed in", "success");
        // short delay so user sees the success before redirect
        setTimeout(() => (window.location = "/tickets"), 700);
      } catch (err) {
        flashMessage("Failed to sign in", "error");
        setSubmitting(loginForm, false);
      }
    });
  }

  const signupForm = document.querySelector('form[data-auth="signup"]');
  if (signupForm) {
    signupForm.addEventListener("input", (e) => {
      if (e.target && e.target.name) clearFieldError(signupForm, e.target.name);
    });

    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const nameEl = signupForm.querySelector('input[name="name"]');
      const emailEl = signupForm.querySelector('input[name="email"]');
      const passwordEl = signupForm.querySelector('input[name="password"]');
      const name = nameEl ? nameEl.value.trim() : "";
      const email = emailEl ? emailEl.value.trim() : "";
      const password = passwordEl ? passwordEl.value : "";
      let hasErr = false;
      if (!name) {
        setFieldError(signupForm, "name", "Name is required");
        hasErr = true;
      }
      if (!email) {
        setFieldError(signupForm, "email", "Email is required");
        hasErr = true;
      }
      if (!password || password.length < 6) {
        setFieldError(
          signupForm,
          "password",
          "Password must be at least 6 characters"
        );
        hasErr = true;
      }
      if (hasErr) return;

      setSubmitting(signupForm, true, "Creating account...");
      try {
        // demo: create account locally then mark as logged in
        login({ id: email, name });
        renderAuthActions();
        flashMessage("Account created", "success");
        setTimeout(() => (window.location = "/tickets"), 700);
      } catch (err) {
        flashMessage("Failed to create account", "error");
        setSubmitting(signupForm, false);
      }
    });
  }
}
initAuthForms();
