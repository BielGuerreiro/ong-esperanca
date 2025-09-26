document.addEventListener("DOMContentLoaded", function () {
  const formSteps = document.querySelectorAll(".form-step");
  const nextButtons = document.querySelectorAll(".btn-next");
  const prevButtons = document.querySelectorAll(".btn-prev");
  let currentStep = 0;

  function showStep(stepIndex) {
    formSteps.forEach((step, index) => {
      step.classList.toggle("active", index === stepIndex);
    });
  }

  nextButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentStep < formSteps.length - 1) {
        currentStep++;
        showStep(currentStep);
      }
    });
  });

  prevButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (currentStep > 0) {
        currentStep--;
        showStep(currentStep);
      }
    });
  });

  // Mostra a primeira etapa inicialmente
  showStep(currentStep);
});
