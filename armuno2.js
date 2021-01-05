function getParameterDefinitions() {
  return [
    { name: 'arm1_a', type: 'float', initial:  0, caption: "arm1 angle:", min: -360, max: 360, step: 10 },
    { name: 'arm2_a', type: 'float', initial:  0, caption: "arm2 angle:", min: -360, max: 360, step: 10 },
    { name: 'arm1_l', type: 'float', initial: 10, caption: "arm1 lenght:", min: 1,    max: 20, step: 1 },
    { name: 'arm2_l', type: 'float', initial: 15, caption: "arm2 length:", min: 1,    max: 20, step: 1 },
    { name: 'thickness', type: 'float', initial: 1, caption: "thickness:", min: 0.1, max: 2, step: 0.1 },
    { name: 'wideness', type: 'float', initial: 2, caption: "wideness:", min: 0.1, max: 4, step: 0.1 },
    { name: 'arm1_gap', type: 'float', initial: 5, caption: "arm1 gap:", min: 0.5, max: 8, step: 0.5 },
    { name: 'arm2_gap', type: 'float', initial: 3, caption: "arm2 gap:", min: 0.5, max: 8, step: 0.5 },
    { name: 'arm2_gap_angle', type: 'float', initial: 45, caption: "arm2 gap angle:", min: 0, max: 90, step: 5 },
    { name: 'arm1_gap2', type: 'float', initial: 6, caption: "arm1 gap2:", min: 0.5, max: 10, step: 0.5 },
    { name: 'arm1_gap2_angle', type: 'float', initial: 45, caption: "arm1 gap2 angle:", min: 0, max: 90, step: 5 },
  ];
}

function armFactory(len, col, params, armLayer=0, begConnectorLayer=-1, endConnectorLayer=0) {
    var arm = cube({size: [params.thickness,params.wideness,len], center:[true,true,false]});
    arm = color(col, arm);
    arm = translate([armLayer*params.thickness,0,0], arm);
    // connector args are: connection point, shaft direction, shaft zero orientation
    arm.properties.beg = new CSG.Connector([(armLayer+begConnectorLayer)*params.thickness, 0,     params.wideness/2], [1, 0, 0], [0, 0, 1]);
    arm.properties.end = new CSG.Connector([(armLayer+endConnectorLayer)*params.thickness, 0, len-params.wideness/2], [1, 0, 0], [0, 0, 1]);
    return arm;
}

function connectTo(beg, end, angle) {
    var matrix = beg.properties.beg.getTransformationTo(
      end.properties.end,
      false,   // mirror
      angle    // normalrotation
    );
    return beg.transform(matrix);
}

function main(params) {
    var {arm1_l,arm1_a,arm2_l,arm2_a,arm1_gap,arm2_gap,arm2_gap_angle,arm1_gap2,arm1_gap2_angle} = params;

    // create arms with connectors at each end, arm0 is the base plate
    var servo2 = armFactory(4, 'black', params);
    var arm1a = armFactory(arm1_gap, 'green', params);
    var arm1b = armFactory(arm1_l, 'lightblue', params);
    var arm2 = armFactory(arm2_l+arm1_gap, 'red', params);
    // connect the arms at the given angle
    arm1a = connectTo(arm1a, servo2, 90+arm2_a);
    arm1b = connectTo(arm1b, arm1a, 270+arm1_a-arm2_a);
    arm2 = connectTo(arm2, arm1b, -90-arm1_a+arm2_a);

    var ancor1 = armFactory(4, 'black',params,5);
    var arm1c = armFactory(arm1_l, 'blue',params,0,1);
    // connect the arms at the given angle
    arm1c = connectTo(arm1c, ancor1, arm1_a);

    var servo1 = armFactory(4, 'black', params, 10);
    var arm1d = armFactory(arm1_l, 'blue', params, 0, 1);
    var arm2b = armFactory(arm2_l, 'red', params, 0, -1);
    var arm2c = armFactory(arm2_gap, 'green', params, 0, -2);
    var arm2cc = armFactory(arm1_gap2, 'green', params, 0, -2);
    var arm2d = armFactory(arm2_l, 'orange', params, 0, 1);
    // connect the arms at the given angle
    arm1d = connectTo(arm1d, servo1, arm1_a);
    arm2b = connectTo(arm2b, arm1d, -90-arm1_a+arm2_a);
    arm2c = connectTo(arm2c, arm1d, -arm2_gap_angle-arm1_a);
    arm2cc = connectTo(arm2cc, arm1d, arm1_gap2_angle-arm1_a);
    arm2d = connectTo(arm2d, arm2c, -90+arm2_gap_angle+arm2_a);

    var ancor2a = armFactory(4, 'black', params, 13);
    var ancor2b = armFactory(arm1_gap2, 'black', params, 0, 0);
    var arm1e = armFactory(arm1_l, 'lightblue', params, 0, 1);
    ancor2b = connectTo(ancor2b, ancor2a, arm1_gap2_angle);
    arm1e = connectTo(arm1e, ancor2b, -arm1_gap2_angle+arm1_a);
    return [
        servo2,
        arm1a,
        arm1b,
        arm2,

        ancor1,
        arm1c,

        servo1,
        arm1d,
        arm2b,
        arm2c,
        arm2cc,
        arm2d,

        ancor2a,
        ancor2b,
        arm1e,
    ];
}
