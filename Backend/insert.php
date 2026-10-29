<?php

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

$host = "127.0.0.1";
$user = "root";
$password = "2359";
$database = "simulation";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    http_response_code(500);

    echo json_encode([
        "error" => "Database connection failed"
    ]);

    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

$time = $data["time"] ?? null;
$blue = $data["blue"] ?? 0;
$yellow = $data["yellow"] ?? 0;
$red = $data["red"] ?? 0;
$green = $data["green"] ?? 0;

$sql = "
    INSERT INTO simulation_history
    (time, blue, yellow, red, green)
    VALUES (?, ?, ?, ?, ?)
";

$stmt = $conn->prepare($sql);

$stmt->bind_param(
    "iiiii",
    $time,
    $blue,
    $yellow,
    $red,
    $green
);

if ($stmt->execute()) {

    echo json_encode([
        "msg" => "Data inserted successfully",
        "insertedId" => $stmt->insert_id
    ]);

} else {

    http_response_code(500);

    echo json_encode([
        "error" => "Insert failed",
        "message" => $stmt->error
    ]);
}

$stmt->close();
$conn->close();

?>