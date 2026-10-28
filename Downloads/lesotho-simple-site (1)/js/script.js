// ---------- GALLERY LIGHTBOX ----------
var images = document.querySelectorAll(".gallery-img");
var current = 0;

function showImage(i) {
  current = (i + images.length) % images.length;
  document.getElementById("bigImage").src = images[current].src;
  document.getElementById("bigImage").alt = images[current].alt;
  document.getElementById("bigCaption").textContent = images[current].alt;
}

if (images.length > 0) {
  var box = new bootstrap.Modal(document.getElementById("lightbox"));
  images.forEach(function (img, i) {
    img.addEventListener("click", function () { showImage(i); box.show(); });
  });
  document.getElementById("prevBtn").addEventListener("click", function () { showImage(current - 1); });
  document.getElementById("nextBtn").addEventListener("click", function () { showImage(current + 1); });
}

// ---------- FORM VALIDATION ----------
function checkField(input, ok, message) {
  var error = input.parentElement.querySelector(".error");
  error.textContent = ok ? "" : message;
  input.classList.toggle("is-invalid", !ok);
  input.classList.toggle("is-valid", ok);
  return ok;
}

var form = document.getElementById("bookingForm");
if (form) {
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = document.getElementById("name");
    var email = document.getElementById("email");
    var phone = document.getElementById("phone");
    var pass = document.getElementById("password");
    var confirm = document.getElementById("confirm");

    var lodge = document.getElementById("lodge");
    var nights = document.getElementById("nights");

    var ok = [
      checkField(lodge, lodge.value !== "0", "Please choose a lodge."),
      checkField(nights, nights.value >= 1 && nights.value <= 30, "Nights must be between 1 and 30."),
      checkField(name, name.value.trim().split(" ").length >= 2, "Enter your first and last name."),
      checkField(email, /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value), "Enter a valid email address."),
      checkField(phone, /^(\+266)?\s?[2-6]\d{7}$/.test(phone.value.trim()), "Enter a valid Lesotho number, e.g. +266 58881234."),
      checkField(pass, pass.value.length >= 8 && /\d/.test(pass.value), "Password needs 8+ characters and a number."),
      checkField(confirm, confirm.value === pass.value && confirm.value !== "", "Passwords do not match.")
    ].every(Boolean);

    var msg = document.getElementById("formMessage");
    if (ok) {
      msg.innerHTML = '<div class="alert alert-success">Thank you! Your booking request was received.</div>';
      form.reset();
      document.getElementById("total").textContent = "M0";
      form.querySelectorAll(".is-valid").forEach(function (f) { f.classList.remove("is-valid"); });
    } else {
      msg.innerHTML = '<div class="alert alert-danger">Please fix the errors below.</div>';
    }
  });
}

// ---------- PRICE CALCULATOR ----------
function updateTotal() {
  var price = Number(document.getElementById("lodge").value);
  var nights = Number(document.getElementById("nights").value) || 0;
  document.getElementById("total").textContent = "M" + (price * nights).toLocaleString();
}
if (form) {
  document.getElementById("lodge").addEventListener("change", updateTotal);
  document.getElementById("nights").addEventListener("input", updateTotal);
}
