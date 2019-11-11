
var waitForSideNav = function() {
  if( typeof $(".button-collapse").sideNav !== 'undefined' 
    && $.isFunction($(".button-collapse").sideNav)) {
    $(".button-collapse").sideNav();
  } else {
    setTimeout(this.waitForSideNav, 100);
  }
};

waitForSideNav();

var sideNavScrollbar = document.querySelector('.custom-scrollbar');
var ps = new PerfectScrollbar(sideNavScrollbar);

$(document).ready(function () {
  $('.mdb-select').material_select();
});

$('.datepicker').pickadate();

$(function () {
	$('[data-toggle="tooltip"]').tooltip()
})

$(function () {
  $('.min-chart#chart-sales').easyPieChart({
    barColor: "#4caf50",
    onStep: function (from, to, percent) {
      $(this.el).find('.percent').text(Math.round(percent));
    }
  });
});

var ctxL = document.getElementById("lineChart").getContext('2d');
var myLineChart = new Chart(ctxL, {
  type: 'line',
  data: {
    labels: ["January", "February", "March", "April", "May", "June", "July"],
    datasets: [{
      label: "My First dataset",
      fillColor: "#fff",
      backgroundColor: 'rgba(255, 255, 255, .3)',
      borderColor: 'rgba(255, 255, 255)',
      data: [0, 10, 5, 2, 20, 30, 45],
    }]
  },
  options: { 
    legend: { labels: { fontColor: "#fff", } },
    scales: { 
      xAxes: [{ 
        gridLines: {
          display: true, 
          color: "rgba(255,255,255,.25)"
        },
        ticks: { fontColor: "#fff", },
      }],
      yAxes: [{
        display: true,
        gridLines: {
          display: true,
          color: "rgba(255,255,255,.25)"
        },
        ticks: { fontColor: "#fff", },
      }],
    }
  }
});

$(function () {
  $('#folder-1').click(function () {
    toastr.error("Folder 1 has been clicked!", "Folder 1", {
      "positionClass": "md-toast-top-right",
    });
  });

  $('#folder-2').click(function () {
    toastr.info("Folder 2 has been clicked!", "Folder 2", );
  });

  $('#folder-3').click(function () {
    toastr.info("Folder 3 has been clicked!", "Folder 3", );
  });
});
