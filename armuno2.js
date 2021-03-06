function getParameterDefinitions() {
  return [
    { name: 'arm1_a', type: 'float', initial:  10, caption: "arm1 angle:", min: -360, max: 360, step: 5 },
    { name: 'arm2_a', type: 'float', initial:  -10, caption: "arm2 angle:", min: -360, max: 360, step: 5 },
    { name: 'arm1_l', type: 'float', initial: 15, caption: "arm1 lenght:", min: 1,    max: 20, step: 1 },
    { name: 'arm2_l', type: 'float', initial: 15, caption: "arm2 length:", min: 1,    max: 20, step: 1 },
    { name: 'thickness', type: 'float', initial: 0.5, caption: "thickness:", min: 0.1, max: 2, step: 0.1 },
    { name: 'wideness', type: 'float', initial: 1, caption: "wideness:", min: 0.1, max: 4, step: 0.1 },
    { name: 'arm1_gap', type: 'float', initial: 5, caption: "arm1 gap:", min: 0.5, max: 8, step: 0.5 },
    { name: 'arm2_gap', type: 'float', initial: 4, caption: "arm2 gap:", min: 0.5, max: 8, step: 0.5 },
    { name: 'arm2_gap_angle', type: 'float', initial: 45, caption: "arm2 gap angle:", min: 0, max: 90, step: 5 },
    { name: 'arm1_gap2', type: 'float', initial: 6, caption: "arm1 gap2:", min: 0.5, max: 10, step: 0.5 },
    { name: 'arm1_gap2_angle', type: 'float', initial: 45, caption: "arm1 gap2 angle:", min: 0, max: 90, step: 5 },
    { name: 'joint_radius', type: 'float', initial: 0.8, caption: "joint radius:", min: 0.1, max: 2, step: 0.1 },
    { name: 'joint_width', type: 'float', initial: 2, caption: "joint width:", min: 0.2, max: 6, step: 0.2 },
    { name: 'holder_length', type: 'float', initial: 4, caption: "holder length:", min: 1, max: 10, step: 0.2 },
  ];
}

function armFactory(len, col, params, armLayer=0, begConnectorLayer=0, endConnectorLayer=0) {
    var radius = Math.min(params.thickness, params.wideness, len) / 8;
    len = Math.max(params.thickness, params.wideness, len);
    var arm = cube({radius, round: true, size: [params.thickness,params.wideness,len], center:[true,true,false]});
    arm = color(col, arm);
    var begOrient = begConnectorLayer<0 ? -1 : 1;
    var endOrient = endConnectorLayer<0 ? -1 : 1;
    begConnectorLayer = Math.abs(begConnectorLayer);
    endConnectorLayer = Math.abs(endConnectorLayer);
    // connector args are: connection point, shaft direction, shaft zero orientation
    arm.properties.beg = new CSG.Connector([begConnectorLayer*params.thickness, 0,     params.wideness/2], [begOrient, 0, 0], [0, 0, 1]);
    arm.properties.end = new CSG.Connector([endConnectorLayer*params.thickness, 0, len-params.wideness/2], [        1, 0, 0], [0, 0, 1]);
    arm = translate([armLayer*params.thickness,0,0], arm);
    return arm;
}

function addJoints(arms, params) {
    var radius = params.joint_radius * Math.min(params.thickness, params.wideness);
    var joints = [];
    for (var i=arms.length; i--; ) {
        var endJoint = color('white', cylinder({r: radius, h: params.joint_width*params.thickness, center: [true, true, true]}));
        endJoint.properties.con = new CSG.Connector([0, 0, 0], [0, 0, 1], [1, 0, 0]);
        endJoint = endJoint.connectTo(endJoint.properties.con, arms[i].properties.end, false, 0);
        joints.push(endJoint);
    }
    return [...arms, ...joints];
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
    var {arm1_l,arm1_a,arm2_l,arm2_a,arm1_gap,arm2_gap,arm2_gap_angle,arm1_gap2,arm1_gap2_angle,holder_length} = params;

    var robot = [];

    // create arms with connectors at each end, arm0 is the base plate
    var servo2 = armFactory(4, 'hotpink', params);
    var arm1a = armFactory(arm1_gap, 'green', params, 0, -1);
    var arm1b = armFactory(arm1_l, 'lightblue', params, 0, 1);
    var arm2a = armFactory(arm2_l+arm1_gap-params.wideness, 'red', params, 0, 1);
    arm1a = connectTo(arm1a, servo2, 90+arm2_a);
    arm1b = connectTo(arm1b, arm1a, 90-arm1_a+arm2_a);
    arm2a = connectTo(arm2a, arm1b, 90+arm1_a-arm2_a);
    robot.push(servo2, arm1a, arm1b, arm2a);

    var ancor1 = armFactory(4, 'black', params, 5);
    var arm1c = armFactory(arm1_l, 'blue', params, 0, 1);
    arm1c = connectTo(arm1c, ancor1, arm1_a);
    robot.push(ancor1, arm1c);

    var servo1 = armFactory(4, 'hotpink', params, 10);
    var arm1d = armFactory(arm1_l, 'blue', params, 0, 1);
    var arm2b = armFactory(arm2_l, 'red', params, 0, -1);
    var arm2c = armFactory(arm2_gap, 'green', params, 0, -2);
    var arm2cc = armFactory(arm1_gap2, 'green', params, 0, -2);
    var arm2d = armFactory(arm2_l, 'orange', params, 0, -1);
    arm1d = connectTo(arm1d, servo1, arm1_a);
    arm2b = connectTo(arm2b, arm1d, -90-arm1_a+arm2_a);
    arm2c = connectTo(arm2c, arm1d, -arm2_gap_angle-arm1_a);
    arm2cc = connectTo(arm2cc, arm1d, arm1_gap2_angle-arm1_a);
    arm2d = connectTo(arm2d, arm2c, +arm2_gap_angle-arm2_a);
    robot.push(servo1, arm1d, arm2b, arm2c, arm2cc, arm2d);

    var ancor2a = armFactory(4, 'black', params, 13);
    var ancor2b = armFactory(arm1_gap2, 'black', params, 0, 0);
    var arm1e = armFactory(arm1_l, 'lightblue', params, 0, 1);
    ancor2b = connectTo(ancor2b, ancor2a, arm1_gap2_angle);
    arm1e = connectTo(arm1e, ancor2b, -arm1_gap2_angle+arm1_a);
    robot.push(ancor2a, ancor2b, arm1e);

    var holder1a = armFactory(holder_length, 'yellow', params, 0, -1);
    var holder1aa = armFactory(arm2_gap, 'yellow', params, 0, -1);
    var holder1b = armFactory(holder_length, 'yellow', params, 0, 1);
    holder1aa = connectTo(holder1aa, arm2b, -arm1_gap2_angle+arm2_a);
    holder1a = connectTo(holder1a, arm2b, arm2_a);
    holder1b = connectTo(holder1b, arm2a, arm2_a);
    robot.push(holder1a, holder1aa, holder1b);

    robot = addJoints(robot, params);

    return robot;
}
