// Tabulator formatters
// Funcion de la liobrería Tabulator para darle formato a la tabla renderizada
Tabulator.prototype.extendModule("format", "formatters", {
    // Esta funcion se encarga de renderizar los headers de cada columna
    header_format: function (cell, formatterParams) {
        let number = cell.getValue().split("-")[0];
        let name = cell.getValue().split("-")[1];
        let day_value = cell.getValue().split("-")[2];
        if (day_value === "w" || day_value === "h") {
            cell.getElement().style.backgroundColor = UNAVAILABLE_COLOR;
        } else if (day_value === "db") {
            cell.getElement().style.backgroundColor = DISABLED_COLOR;
            cell.getElement().style.color = BASE_COLOR;
        }
        return "<p>" + name.charAt(0).toUpperCase() + name.slice(1) + "</p> <p>" + number + "</p>";
    },
    // Esta funcion evalua cada una de las celdas de acuaerdo al valor que tengan
    cell_format: function (cell, formatterParams) {
        let day_value = cell.getValue();
        if (day_value === "f") {
            cell.getElement().style.backgroundColor = BASE_COLOR;
            cell.getElement().style.color = BASE_COLOR;
        } else if (day_value === "db") {
            cell.getElement().style.backgroundColor = DISABLED_COLOR;
            cell.getElement().style.color = DISABLED_COLOR;
        } else if (day_value === "w" || day_value === "h") {
            cell.getElement().style.backgroundColor = UNAVAILABLE_COLOR;
            cell.getElement().style.color = UNAVAILABLE_COLOR;
        } else if (day_value === "v") {
            cell.getElement().style.backgroundColor = VACATION_COLOR;
            cell.getElement().style.color = VACATION_COLOR;
        } else if (day_value === "g") {
            cell.getElement().style.backgroundColor = GREEN_COLOR;
            cell.getElement().style.color = GREEN_COLOR;
        } else if (day_value === "y") {
            cell.getElement().style.backgroundColor = YELLOW_COLOR;
            cell.getElement().style.color = YELLOW_COLOR;
        } else if (day_value === "o") {
            cell.getElement().style.backgroundColor = ORANGE_COLOR;
            cell.getElement().style.color = ORANGE_COLOR;
        } else if (day_value === "r") {
            cell.getElement().style.backgroundColor = RED_COLOR;
            cell.getElement().style.color = RED_COLOR;
        } else if (day_value === "rem") {
            cell.getElement().style.backgroundColor = REMOTE_COLOR;
            cell.getElement().style.color = REMOTE_COLOR;
        }
        return cell.getValue();
    }
});
// Lista de colores usados en la tabla
const BASE_COLOR = "#ffffff";
const DISABLED_COLOR = "#40434E";
const UNAVAILABLE_COLOR = "#bdbdbd";
const REMOTE_COLOR = "#754668";
const VACATION_COLOR = "#1A64DB";
const GREEN_COLOR = "#006B3E";
const RED_COLOR = "#ED2938";
const YELLOW_COLOR = "#FFE733";
const ORANGE_COLOR = "#FF8C01";