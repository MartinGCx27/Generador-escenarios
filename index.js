// Funcion encargade de verificar la activacion/desactivacion de manualmente
const columnStatusToggle = (e, columnObj) => {
    col = columnObj._column;
    let in_dis = false;
    if (col.definition.title.split("-")[2] !== "w" && col.definition.title.split("-")[2] !== "h") {
        col_field = col.field;
        table_id = col.definition.title.split("-")[3];
        for (let i = 0; i < disabled_days_array.length; i++) {
            if ((disabled_days_array[i][0] === parseInt(table_id)) && (disabled_days_array[i][1] === parseInt(col_field))) {
                disabled_days_array.splice(i, 1);
                in_dis = true;
            }
        }
        if (!in_dis) {
            disabled_days_array.push([parseInt(table_id), parseInt(col_field)]);
        }
        generate_btn.click();
    }
}

// Funcion que crea los datos en el formato necesario para ser leidos por la libreria Tabulator
// Para la renderizacion de la tabla
/*
    month_array - arreglo bidimensional que representa el mes
    year - año
    month - mes
    table_id - id generado para identificar la tabla que se creara

    Retorna:
    Arreglo:
    table_cols - objeto de columnas para Tabulator
    table_data - objeto con los datos del mes (celdas)
*/
function createTableData(month_array, year, month, table_id) {
    let n = month_array.length;
    let table_data = [];
    let table_cols = [];
    let temp_date;
    let day_name;
    // For encargado de crear el objeto de columnas para Tabulator
    for (let i = 0; i < month_array[0].length; i++) {
        table_cols.push({});
        temp_date = new Date(year, month - 1, i + 1);
        day_name = temp_date.toLocaleString("spanish", { weekday: "short" });
        table_cols[i]["formatter"] = "cell_format";
        let header_value = "f";
        if (month_array[0][i] === "h" || month_array[0][i] === "w") {
            header_value = month_array[0][i];
        } else if (disabled_days_array.length > 0) {
            for (let j = 0; j < disabled_days_array.length; j++) {
                if (disabled_days_array[j][0] === table_id) {
                    if (disabled_days_array[j][1] - 1 === i) {
                        header_value = "db";
                    }
                }
            }
        }
        table_cols[i]["title"] = (i + 1).toString() + "-" + day_name + "-" + header_value + "-" + table_id;
        table_cols[i]["titleFormatter"] = "header_format";
        table_cols[i]["field"] = (i + 1).toString();
        table_cols[i]["headerClick"] = columnStatusToggle;
    }
    // for encargado de crear el objeto de celdas (de los datos del mes)
    for (let i = 0; i < n; i++) {
        table_data.push({});
        for (let j = 0; j < month_array[0].length; j++) {
            table_data[i][(j + 1).toString()] = month_array[i][j];
        }
    }
    return [table_cols, table_data];
}
// Funcion que tiene la representacion de un dia con la nomenclatura de una columna
// y regresa una cadena formateada de ese día
function getDayData(day) {
    day_arr = day.split("-");
    return [day_arr[1].charAt(0).toUpperCase() + day_arr[1].slice(1) + " " + day_arr[0], day_arr[2]];
}
// Funcion que crea las tablas de estadisticas y la del mes
/*
    cols - objeto de columnas para Tabulator
    data - objeto de datos para Tabulator (mes)
    el_counter - contador de meses generados
    month - mes
    month_arr - arreglo del mes
*/
function createTables(cols, data, el_counter, stat_arr, month, month_arr) {
    // Manejo de los ids de acuerdo al numero de meses que se hayan generado
    let table_id = "table" + el_counter.toString();
    let table_container_id = "table_cont" + el_counter.toString();
    let stat_id = "stat" + el_counter.toString();
    let title_id = "title" + el_counter.toString();
    let acum_id = "acum" + el_counter.toString();
    let rem_id = "rem" + el_counter.toString();
    let week_id = "week" + el_counter.toString();
    let new_table = document.getElementById(table_id);
    let new_stat = document.getElementById(stat_id);
    let new_title = document.getElementById(title_id);
    let new_acum = document.getElementById(acum_id);
    let new_table_cont = document.getElementById(table_container_id);
    let new_rem_tbl = document.getElementById(rem_id);
    let new_week_tbl = document.getElementById(week_id);
    // Verificar si ya existen las tablas que se queren crear
    if (new_table) {
        new_stat.innerHTML = "";
        new_rem_tbl.innerHTML = "";
        new_week_tbl.innerHTML = "";
        if (new_acum)
            new_acum.innerHTML = "";
        CONTENT.innerHTML = "";
    } else { // Crearlas de lo contrario
        new_table = document.createElement('div');
        new_table.id = table_id;
        new_stat = document.createElement('table');
        new_stat.id = stat_id;
        new_title = document.createElement('h3');
        new_title.id = title_id;
        new_acum = document.createElement('table');
        new_acum.id = acum_id;
        new_table_cont = document.createElement('div');
        new_table_cont.id = table_container_id;
        new_table_cont.className = "table-container";
        new_rem_tbl = document.createElement('table');
        new_rem_tbl.id = rem_id;
        new_week_tbl = document.createElement('table');
        new_week_tbl.id = week_id;
    }
    // Agregar nombre del mes
    new_title.innerHTML = MONTH_NAMES[month - 1];
    // Tabla de remotas
    rem_arr = [["", "Remotas Posibles"],
    ["Mes:", stat_arr[10]],
    ["Acumulado:", count_rem]];
    let temp_row;
    let temp_el;
    for (let i = 0; i < rem_arr.length; i++) {
        temp_row = document.createElement('tr');
        for (let j = 0; j < rem_arr[0].length; j++) {
            if (j === 0) {
                temp_el = document.createElement('th');
            } else {
                temp_el = document.createElement('td');
            }
            temp_el.innerHTML = rem_arr[i][j];
            temp_row.appendChild(temp_el);
        }
        new_rem_tbl.appendChild(temp_row);
    }
    // Tabla de desglose de visitas por color y calculo de porcentajes
    let per_g;
    let per_y;
    let per_o;
    let per_r;
    let per_cr;
    stat_arr[0] > 0 ? per_g = ((stat_arr[5] / stat_arr[0]) * 100).toFixed(2) : per_g = 0;
    stat_arr[1] > 0 ? per_y = ((stat_arr[6] / stat_arr[1]) * 100).toFixed(2) : per_y = 0;
    stat_arr[2] > 0 ? per_o = ((stat_arr[7] / stat_arr[2]) * 100).toFixed(2) : per_o = 0;
    stat_arr[3] > 0 ? per_r = ((stat_arr[8] / stat_arr[3]) * 100).toFixed(2) : per_r = 0;
    stat_arr[4] > 0 ? per_cr = ((stat_arr[9] / stat_arr[4]) * 100).toFixed(2) : per_cr = 0;
    stat_table = [["", "Verde", "Amarillo", "Naranjas", "Rojo", "Totales"],
    ["Posibles:", stat_arr[0], stat_arr[1], stat_arr[2], stat_arr[3], stat_arr[4]],
    ["Escenario:", stat_arr[5], stat_arr[6], stat_arr[7], stat_arr[8], stat_arr[9]],
    ["Porcentajes:", (per_g.toString()) + "%", (per_y.toString()) + "%", (per_o.toString()) + "%", (per_r.toString()) + "%", (per_cr.toString()) + "%"]];
    for (let i = 0; i < 4; i++) {
        let temp_tr = document.createElement('tr');
        for (let j = 0; j < 6; j++) {
            let temp_el;
            if (j === 0) {
                temp_el = document.createElement('th');
            } else {
                temp_el = document.createElement('td');
            }
            temp_el.innerHTML = stat_table[i][j];
            temp_tr.appendChild(temp_el);
        }
        new_stat.appendChild(temp_tr);
    }
    new_table_cont.appendChild(new_table);
    CONTENT.appendChild(new_title);
    CONTENT.appendChild(new_table_cont);
    let new_caption = document.createElement('caption');
    if (sum_cr === 0) {
        new_caption.innerHTML = "Mensual/Acumulado";
        new_stat.appendChild(new_caption);
    } else {
        new_caption = document.createElement('caption');
        new_caption.innerHTML = "Mensual";
        new_stat.appendChild(new_caption);
        new_caption = document.createElement('caption');
        new_caption.innerHTML = "Acumulado";
        new_acum.appendChild(new_caption);
        stat_arr[0] > 0 ? per_g = (((sum_g + stat_arr[5]) / g) * 100).toFixed(2) : per_g = 0;
        stat_arr[1] > 0 ? per_y = (((sum_y + stat_arr[6]) / y) * 100).toFixed(2) : per_y = 0;
        stat_arr[2] > 0 ? per_o = (((sum_o + stat_arr[7]) / o) * 100).toFixed(2) : per_o = 0;
        stat_arr[3] > 0 ? per_r = (((sum_r + stat_arr[8]) / r) * 100).toFixed(2) : per_r = 0;
        stat_arr[4] > 0 ? per_cr = (((sum_cr + stat_arr[9]) / cr) * 100).toFixed(2) : per_cr = 0;
        stat_table = [["", "Verde", "Amarillo", "Naranjas", "Rojo", "Totales"], ["Posibles:", g, y, o, r, cr],
        ["Escenario:", sum_g + stat_arr[5], sum_y + stat_arr[6], sum_o + stat_arr[7], sum_r + stat_arr[8], sum_cr + stat_arr[9]],
        ["Porcentajes:", (per_g.toString()) + "%", (per_y.toString()) + "%", (per_o.toString()) + "%", (per_r.toString()) + "%", (per_cr.toString()) + "%"]];
        for (let i = 0; i < 4; i++) {
            let temp_tr = document.createElement('tr');
            for (let j = 0; j < 6; j++) {
                let temp_el;
                if (j === 0) {
                    temp_el = document.createElement('th');
                } else {
                    temp_el = document.createElement('td');
                }
                temp_el.innerHTML = stat_table[i][j];
                temp_tr.appendChild(temp_el);
            }
            new_acum.appendChild(temp_tr);
        }
    }
    CONTENT.appendChild(new_stat);
    // Tabla de desglose semanal de visitas
    let weeks = [];
    let week_name = "";
    let week_start = -1;
    let week_end = -1;
    for (let i = 0; i < cols.length; i++) {
        let day_arr = getDayData(cols[i]["title"]);
        let day_name = day_arr[0];
        let day_status = day_arr[1];
        if ((day_status === "w") || i === (cols.length - 1)) {
            if (week_name.length > 0) {
                if (i === (cols.length - 1)) {
                    week_name += " - " + getDayData(cols[i]["title"])[0];
                    week_end = i;
                } else {
                    week_name += " - " + getDayData(cols[i - 1]["title"])[0];
                    week_end = i - 1;
                }
                weeks.push([week_start, week_end, week_name]);
                week_name = "";
                week_start = -1;
                week_end = -1;
            }
        } else {
            if (week_name.length === 0) {
                week_name = day_name;
                week_start = i;
            }
        }
    }
    week_summary = [[""], ["Verdes:"], ["Amarillas:"], ["Naranjas:"], ["Rojas:"], ["Remotas:"], ["Totales:"]];
    for (let i = 0; i < weeks.length; i++) {
        week_summary[0].push(weeks[i][2]);
        let w_g = 0;
        let w_y = 0;
        let w_o = 0;
        let w_r = 0;
        let w_rem = 0;
        let w_total = 0;
        for (let j = 0; j < month_arr.length; j++) {
            for (let k = weeks[i][0]; k <= weeks[i][1]; k++) {
                if (month_arr[j][k] === "g") {
                    w_g++;
                    w_total++;
                } else if (month_arr[j][k] === "y") {
                    w_y++;
                    w_total++;
                } else if (month_arr[j][k] === "o") {
                    w_o++;
                    w_total++;
                } else if (month_arr[j][k] === "r") {
                    w_r++;
                    w_total++;
                } else if (month_arr[j][k] === "rem") {
                    w_rem++;
                    w_total++;
                }
            }
        }
        week_summary[1].push(w_g);
        week_summary[2].push(w_y);
        week_summary[3].push(w_o);
        week_summary[4].push(w_r);
        week_summary[5].push(w_rem);
        week_summary[6].push(w_total);
    }
    for (let i = 0; i < 7; i++) {
        let temp_tr = document.createElement('tr');
        for (let j = 0; j < week_summary[0].length; j++) {
            let temp_el;
            if (j === 0) {
                temp_el = document.createElement('th');
            } else {
                temp_el = document.createElement('td');
            }
            temp_el.innerHTML = week_summary[i][j];
            temp_tr.appendChild(temp_el);
        }
        new_week_tbl.appendChild(temp_tr);
    }
    CONTENT.appendChild(new_week_tbl);
    if (sum_cr > 0) CONTENT.appendChild(new_acum);
    // Creacion de la tabla del mes
    let table_tabu = new Tabulator("#" + table_id, {
        locale: true,
        resizableColumns: false,
        headerSort: false,
        data: data,
        columns: cols,
        layout: "fitData",
        maxHeight: 437,
    });
    calendar_array.push(table_tabu);
    CONTENT.appendChild(new_rem_tbl);
}
// Funcion encargada de orquestar desde la creacion del arreglo del mes hasta el renderizado de la tabla final
/* 
    year - año
    month - mes
    g - numero de verdes a llenar
    y - numero de amarillas a llenar
    o - numero de naranjas a llenar
    r - numero de rojas a llenar
    g_r - intervalo entre cada verde
    y_r - intervalo entre cada amarilla
    o_r - intervalo entre cada naranja
    r_r - intervalo entre cada roja
    cr - total de visitas a realizar
    el_counter - contador de meses generados
    vacations_array - arreglo que contiene los datos parseados del csv que se sube con la informacion del mes

    Retorna:
    Estadisticas resultantes de la asignacion de los dias
*/
function schedule(year, month, g, y, o, r, g_r, y_r, o_r, r_r, cr, el_counter, vacations_array = []) {
    let month_array = [];
    if (vacations_array.length > 0) {
        month_array = generateMonthArray(year, month, el_counter, vacations_array);
    } else {
        month_array = generateMonthArray(year, month, el_counter);
    }
    if (month_array.length <= 0) {
        return 0;
    }
    let res_arr = generateMonthSchedule(g, y, o, r, g_r, y_r, o_r, r_r, cr, month_array);
    let table_data = createTableData(res_arr[0], year, month, el_counter);
    let table = createTables(table_data[0], table_data[1], el_counter, res_arr[1], month, res_arr[0]);
    return res_arr[1];
}
// Definicion de variables globales
// Inputs de datos
const month_picker = document.getElementById('starting-month');
const toggle_percent = document.getElementById("toggle-percent");
const toggle_remotes = document.getElementById("toggle-remotes");
const generate_btn = document.getElementById('generate-btn');
const download_btn = document.getElementById('download-btn');
const cr_input = document.getElementById('cr-input');
const green_input = document.getElementById('green-input');
const yellow_input = document.getElementById('yellow-input');
const orange_input = document.getElementById('orange-input');
const green_rule = document.getElementById('green-rule');
const yellow_rule = document.getElementById('yellow-rule');
const orange_rule = document.getElementById('orange-rule');
const red_input = document.getElementById('red-input');
const red_rule = document.getElementById('red-rule');
const consultant_input = document.getElementById('consultant-input');
const vacation_input = document.getElementById('vacation-input');
// Fecha del dia de ejecucion (hoy)
const TODAY_DATE = new Date();
// Variable del div donde se muestra todo el contenido
const CONTENT = document.getElementById('content');
// Nombres de los meses del año
const MONTH_NAMES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
// cantidad de visitas por a realizar por color y sus intervalos de visita
let g;
let g_r;
let y;
let y_r;
let o;
let o_r;
let r;
let r_r;
// total de visitas
let cr;
// numero de agentes
let consultants;
// contadores de visitas realizadas por color
let sum_g;
let sum_y;
let sum_o;
let sum_r;
let sum_cr;
// arreglo con los datos de archivo cargado
let vacation_data_array;
// dias deshabilitados manualmente
let disabled_days_array;
// añó de inicio del escenario
let starting_year;
// mes de inicio del escenario
let starting_month;
// variable de mes auxiliar
let data_month;
// esta activado evaluar como  porcentajes
let is_toggle_checked = false;
// esta activado llenar con remotas
let fill_remotes = false;
// Contadore de remotas
let count_rem;
// Arreglo de dias de intervalo que pasan a otro mes
let day_remainder = [];
// Cantidad de dias bloqueados al principio
let blocking_days = 0;
// Arreglo que contiene los meses generador para su descarga
let calendar_array = [];
// Valores default de los inputs
green_input.value = 200;
yellow_input.value = 300;
orange_input.value = 300;
red_input.value = 200;
orange_rule.value = 5;
// Eventlisteners y setup general
// Poner mes en curso en el input de mes
month_picker.value = `${TODAY_DATE.getFullYear()}-${("0" + (TODAY_DATE.getMonth() + 1)).slice(-2)}`;
// Evitar valores vacios en inputs de cantidad de visitas por color y sus intervalos
green_input.addEventListener('change', () => {
    if (green_input.value === "") {
        green_input.value = 0;
    }
});
green_rule.addEventListener('change', () => {
    if (green_rule.value === "") {
        green_rule.value = 0;
    }
});
yellow_input.addEventListener('change', () => {
    if (yellow_input.value === "") {
        yellow_input.value = 0;
    }
});
yellow_rule.addEventListener('change', () => {
    if (yellow_rule.value === "") {
        yellow_rule.value = 0;
    }
});
orange_input.addEventListener('change', () => {
    if (orange_input.value === "") {
        orange_input.value = 0;
    }
});
orange_rule.addEventListener('change', () => {
    if (orange_rule.value === "") {
        orange_rule.value = 0;
    }
});
red_input.addEventListener('change', () => {
    if (red_input.value === "") {
        red_input.value = 0;
    }
});
red_rule.addEventListener('change', () => {
    if (red_rule.value === "") {
        red_rule.value = 0;
    }
});
consultant_input.addEventListener('change', () => {
    if (consultant_input.value === "") {
        consultant_input.value = 0;
    }
});
// Obtener el mes y año de inicio del escenario
starting_year = parseInt(month_picker.value.split("-")[0]);;
starting_month = parseInt(month_picker.value.split("-").pop());;
data_month = starting_month;
// Inicializar arreglos necesarios
vacation_data_array = [];
disabled_days_array = [];
// Funcion de cambiar la forma de evaluar los valores por color (cantidad fija o por porcentajes)
toggle_percent.addEventListener('change', (e) => {
    is_toggle_checked = e.target.checked ? true : false;
    let arr_id = ["gl", "yl", "ol", "rl"];
    let arr_text = ["verde", "amarillo", "naranja", "rojo"];
    for (let i = 0; i < arr_id.length; i++) {
        let lbl = document.getElementById(arr_id[i]);
        if (is_toggle_checked) {
            lbl.innerHTML = "Sucursales en " + arr_text[i] + " (%):"
        } else {
            lbl.innerHTML = "Sucursales en " + arr_text[i] + ":"
        }
    }
});
// Funcion para cambiar el llenado de dias bloqueados por el input (remotas o dias bloqueados)
toggle_remotes.addEventListener('change', (e) => {
    fill_remotes = e.target.checked ? true : false;
    let lbl = document.getElementById("days-lbl");
    if (fill_remotes) {
        lbl.innerHTML = "Llenar con visitas remotas";
    } else {
        lbl.innerHTML = "Llenar con días bloqueados";
    }
});
// Funcion encargada de descarga los archivos de los meses generados
download_btn.addEventListener('click', () => {
    if (calendar_array.length <= 0) {
        alert("ERROR: Genera un escenario primero");
    } else {
        let html_div;
        let temp_id;
        for (let i = 0; i < calendar_array.length; i++) {
            temp_id = "html-inv" + i;
            html_div = document.createElement("div");
            html_div.className = "hidden-div";
            html_div.id = temp_id;
            html_div.innerHTML = calendar_array[i].getHtml();
            CONTENT.appendChild(html_div);
            fnExcelReport(temp_id);
        }
    }
});
// Escuchar los eventos de cambio de mes de inicio
month_picker.addEventListener('change', () => {
    starting_year = parseInt(month_picker.value.split("-")[0]);
    starting_month = parseInt(month_picker.value.split("-").pop());
    data_month = starting_month;
    vacation_data_array = [];
    disabled_days_array = [];
    vacation_input.value = "";
});
// Funcion que se encarga del parsing de los datos de las vacaciones
vacation_input.addEventListener('change', () => {
    if (vacation_input.files.length === 0) {
    } else {
        Papa.parse(vacation_input.files[0], {
            complete: function (result_parsing) {
                vacations_data = result_parsing.data;
                month_days = getNumberOFDaysByMonth(starting_year, data_month);
                if (month_days != (vacations_data[0].length - 3)) {
                    data_month = starting_month;
                    vacation_input.value = "";
                    alert("Número de días del mes no coincide con número de columnas del archivo CSV.")
                } else {
                    vacation_data_array.push(vacations_data);
                    vacation_input.value = "";
                    alert("Información de vacaciones del mes de " + MONTH_NAMES[data_month - 1] + " cargada.");
                    // generate_btn.click();
                    data_month++;
                    if (data_month > 12) {
                        year++;
                        data_month = 1;
                    }
                }
            }
        });
    }
});
// Funcion que escucha el evento de click en el boton de generar escenario y se encarga del proceso
generate_btn.addEventListener('click', (e) => {
    // Obtener el año y mes de inicio del escenario
    starting_year = parseInt(month_picker.value.split("-")[0]);
    starting_month = parseInt(month_picker.value.split("-").pop());
    // Obtener valor de input de agentes
    consultants = parseInt(consultant_input.value);
    // Inicializar arreglo de tablas
    calendar_array = [];
    // Inicializar contador de remotas
    count_rem = 0;
    // Verificar si se tiene que evaluar sucursales por porcentaje o cantidad fija
    if (is_toggle_checked) {
        cr = parseInt(cr_input.value);
        g_per = parseInt(green_input.value);
        y_per = parseInt(yellow_input.value);
        o_per = parseInt(orange_input.value);
        r_per = parseInt(red_input.value);
        per_sum = g_per + y_per + o_per + r_per;
        if (per_sum < 100 || per_sum > 100) {
            alert("Los porcentajes son incorrectos. Verifique los valores");
            return false;
        }
        g = Math.floor((g_per * cr) / 100);
        y = Math.floor((y_per * cr) / 100);
        o = Math.floor((o_per * cr) / 100);
        r = Math.floor((r_per * cr) / 100);
        if ((g + y + o + r) <= cr) {
            let option = 0;
            while ((g + y + o + r) < cr) {
                if (option === 0) {
                    g++;
                    option++;
                } else if (option === 1) {
                    y++;
                    option++;
                } if (option === 2) {
                    o++;
                    option++;
                } if (option === 3) {
                    r++;
                    option = 0;
                }
            }
        }
    } else {
        g = parseInt(green_input.value);
        y = parseInt(yellow_input.value);
        o = parseInt(orange_input.value);
        r = parseInt(red_input.value);
        cr = g + y + o + r;
        cr_input.value = cr;
    }
    g_r = parseInt(green_rule.value);
    y_r = parseInt(yellow_rule.value);
    o_r = parseInt(orange_rule.value);
    r_r = parseInt(red_rule.value);
    // Contador de meses
    let el_counter = 0;
    // inicializar contadores de visitas por color y totales
    sum_g = 0;
    sum_y = 0;
    sum_o = 0;
    sum_r = 0;
    sum_cr = 0;
    // Obtener los dias bloqueados al principio
    let empty_days = document.getElementById("empty-start-days").value;
    // Obtener los dias del mes
    let days_n = getNumberOFDaysByMonth(starting_year, starting_month);
    // Evaluar valor de dias bloqueados
    if (isNumeric(empty_days)) {
        let int_empty = parseInt(empty_days);
        if (int_empty < 0 || int_empty > days_n) {
            alert("ERROR: Ingresa un valor válido para días de inicio bloqueados");
            return false;
        } else {
            blocking_days = int_empty;
        }
    } else {
        alert("ERROR: Ingresa un valor válido para días de inicio bloqueados");
        return false;
    }
    // comenzar a generar el escenario
    // caso sin archivo de vacaciones
    if (vacation_data_array.length <= 0) {
        // Obtener resultados de la primera ejecución
        let results = schedule(starting_year, starting_month, g, y, o, r, g_r, y_r, o_r, r_r, cr, el_counter);
        // Sumar al total las visitas agendadas
        sum_cr += results[9];
        // Si quedan mas crs por agendar se realizar otro mes hasta que no queden crs por agendar
        while ((cr - sum_cr) > 0) {
            // Incrementar contador de mes
            el_counter++;
            // Cambiar de mes
            starting_month++;
            // Verificar que sigamos en el mismo año o aumentar de ser el caso
            if (starting_month > 12) {
                starting_year++;
                starting_month = 1;
            }
            // Sumar resultados por color
            sum_g += results[5];
            sum_y += results[6];
            sum_o += results[7];
            sum_r += results[8];
            // realizar siguiente mes
            results = schedule(starting_year, starting_month, g - sum_g, y - sum_y, o - sum_o, r - sum_r, g_r, y_r, o_r, r_r, cr - sum_cr, el_counter);
            // Agegar al total de visitas agendadas
            sum_cr += results[9];
        }
    } else {
        // Obtener resultados de la primera ejecución
        results = schedule(starting_year, starting_month, g, y, o, r, g_r, y_r, o_r, r_r, cr, el_counter, vacation_data_array[el_counter]);
        // Sumar al total las visitas agendadas
        sum_cr += results[9];
        // Si quedan mas crs por agendar se realizar otro mes hasta que no queden crs por agendar
        while ((cr - sum_cr) > 0) {
            // Incrementar contador de mes
            el_counter++;
            // Cambiar de mes
            starting_month++;
            // Verificar que sigamos en el mismo año o aumentar de ser el caso
            if (starting_month > 12) {
                starting_year++;
                starting_month = 1;
            }
            // Sumar resultados por color
            sum_g += results[5];
            sum_y += results[6];
            sum_o += results[7];
            sum_r += results[8];
            // Verificar si hay informacion del mes siguiente cargada
            if (el_counter < vacation_data_array.length) {
                // Usar la informacion
                // realizar siguiente mes
                results = schedule(starting_year, starting_month, g - sum_g, y - sum_y, o - sum_o, r - sum_r, g_r, y_r, o_r, r_r, cr - sum_cr, el_counter, vacation_data_array[el_counter]);
            }
            else {
                // Proceder sin carga de archivo
                // realizar siguiente mes
                results = schedule(starting_year, starting_month, g - sum_g, y - sum_y, o - sum_o, r - sum_r, g_r, y_r, o_r, r_r, cr - sum_cr, el_counter);
            }
            // Agegar al total de visitas agendadas
            sum_cr += results[9];
        }
    }
    // Resetear el arreglo de dias de intervalo para otra ejecucion
    day_remainder = [];
    e.preventDefault();
});