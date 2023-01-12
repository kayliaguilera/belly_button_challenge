function init() {
    // Variable for selector option
    var selector = d3.select("#selDataset");

    // Read from URL or JSON file
    d3.json("https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json").then((data) => {
    // d3.json("data/samples.json").then((data) => {
        var sampleNames = data.names;

        // Populate names for selector
        sampleNames.forEach(sample => {
            selector
                .append("option")
                .text(sample)
                .property("value", sample);
        });
        
        // Display first sampleName from list to build initial plots
        var initialSample = sampleNames[0];

        buildMetadata(initialSample);
        buildCharts(initialSample);
    });
}

// Initialize the dashboard
init();

// Function to update metadata and charts when new sample selected
function optionChanged(newSample) {
    buildMetadata(newSample);
    buildCharts(newSample);
}

// Demographics Panel
function buildMetadata(sample) {
    d3.json("https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json").then((data) => {
        var metadata = data.metadata;

        // Filter the data for object with selected sample number
        var metadataArray = metadata.filter(sampleObj => sampleObj.id == sample);
        var selectedSample = metadataArray[0];
        var PANEL = d3.select("#sample-metadata");

        // Clear PANEL before populating with new data
        PANEL.html("");

        Object.entries(selectedSample).forEach(([key, value]) => {
            PANEL.append("h6").text(`${key}: ${value}`);
        });
    });
}

// Create all charts
function buildCharts(sample) {
    d3.json("https://2u-data-curriculum-team.s3.amazonaws.com/dataviz-classroom/v1.1/14-Interactive-Web-Visualizations/02-Homework/samples.json").then((data) => {
        var samples = data.samples;

        // Filter the data for object with selected sample number
        var sampleArray = samples.filter(sampleObj => sampleObj.id == sample);
        // Filter the data for object with selected sample number (used to retrieve for wash frequency)
        var metadataArray = data.metadata.filter(sampleObj => sampleObj.id == sample);

        var selectedSample = sampleArray[0];

        var otu_ids = selectedSample.otu_ids;
        var otu_labels = selectedSample.otu_labels;
        var sample_values = selectedSample.sample_values;
        var wfreq = metadataArray[0].wfreq;

    // -------- BAR CHART -------------------------------------
        // Create y labels with "OTU" preceding otu_id ie. OTU 1167
        var yticks = otu_ids.slice(0,10).map(outId => `OTU ${outId}`).reverse();

        var barData = [{
            x: sample_values.slice(0,10).reverse(),
            y: yticks,
            type: "bar",
            orientation: "h",
            text: otu_labels.slice(0,10),
        }];

        var barLayout = {
            title: "Top 10 OTUs per Sample"
        };

        Plotly.newPlot("bar", barData, barLayout);
    // -------- BAR CHART -------------------------------------

    // -------- GAUGE CHART (combination scatter and Pie chart)-
        // Trig to calc meter point
        var degrees = 180 - wfreq * 20,
            radius = .5;
        var radians = degrees * Math.PI / 180;
        var x = radius * Math.cos(radians);
        var y = radius * Math.sin(radians);

        // Path: may have to change to create a better triangle
        var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
             pathX = String(x),
             space = ' ',
             pathY = String(y),
             pathEnd = ' Z';
         var path = mainPath.concat(pathX, space, pathY, pathEnd);

        // Path to create consistent triangle regardless of wfreq
        var mainPath = 'M ',
            pathX1 = -1 * Math.sin(radians) * .025,
            pathY1 = Math.cos(radians) * .025,
            pathX2 = -1 * pathX1,
            pathY2 = -1 * pathY1; 

        var path = mainPath.concat(pathX1, ' ', pathY1, ' L ', pathX2, ' ', pathY2, ' L ', String(x), ' ', String(y), ' Z'); 

        var scatterData = { 
            // Scatter plot to display dot @ "origin"
            type: 'scatter',
            x: [0], y: [0],
            marker: {
                size: 28, 
                color:'850000',
                },
            showlegend: false,
            text: wfreq,
            hoverinfo: 'text'
        };

        var pieData = { 
            // Pie chart created to imitate Gauge chart
            values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
            rotation: 90,
            text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2','0-1', ''],
            textinfo: 'text',
            textposition:'inside',	  
            marker: { 
                colors: ['rgba(15, 128, 0, .5)', 'rgba(15, 128, 0, .45)', 'rgba(15, 128, 0, .4)',
                        'rgba(110, 154, 22, .5)', 'rgba(110, 154, 22, .4)','rgba(110, 154, 22, .3)',
                        'rgba(210, 206, 145, .5)','rgba(210, 206, 145, .4)','rgba(210, 206, 145, .3)',
                        'rgba(255, 255, 255, 0)']
                },
            hole: .5,
            type: 'pie',
            hoverinfo: 'text',
            showlegend: false
        };

        var gaugeData = [scatterData, pieData];

        var gaugeLayout = {
            // Needle
            shapes: [{
                type: 'path',
                path: path,
                fillcolor: '850000',
                line: { color: '850000' }
            }],
            title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
            height: 500, width: 500,
            xaxis: { zeroline:false, showticklabels:false, showgrid: false, range: [-1, 1]},
            yaxis: { zeroline:false, showticklabels:false, showgrid: false, range: [-1, 1]}
        };

        Plotly.newPlot('gauge', gaugeData, gaugeLayout);
    // -------- GAUGE CHART -------------------------------------

    // -------- BUBBLE CHART -------------------------------------
        var bubbleData = [{
            x: otu_ids,
            y: sample_values,
            mode: "markers",
            marker: { 
                size: sample_values,
                color: otu_ids,
                colorscale: 'Earth'
            },
            text: otu_labels,
        }];

        var bubbleLayout = {
            xaxis: {title: "OTU ID"},
            height: 600,
            width: 1200
        }

        Plotly.newPlot("bubble", bubbleData, bubbleLayout);
    // -------- BUBBLE CHART -------------------------------------

    });
}