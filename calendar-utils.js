// Función que obtiene el número de días en un mes
/*
    year - año
    month - mes

    Retorna:
    número de días que hay en el mes
*/
function getNumberOFDaysByMonth(year, month) {
    return new Date(year, month, 0).getDate();
}

// Funcion que obtiene el estatus de un día (libre, fin de semana o festivo)
/*
    day - día
    month - mes
    year - año

    Retorna:
    cadena con el estatus del día (f, h, w)
*/
function calculateDayStatus(day, month, year) {
    let day_status = "f";
    let temp_date = new Date(year, month - 1, day);
    let day_name = temp_date.toLocaleString("spanish", { weekday: "short" });
    if (LAW_DAYS[year][month] === day) {
        day_status = "h";
    }
    if (day_name.includes("s") || day_name.includes("d")) {
        day_status = "w";
    }
    return day_status;
}

// Funcion que crea la representacion del un mes en dorma de arreglo bidimensional
/*
    year - año
    month - mes
    table_id - id generado para identificar la tabla que se creara
    vacations_array - arreglo que contiene los datos parseados del csv que se sube con la informacion del mes
    puede estar vacío cuando no se haya subido ninguna información

    Retorna:
    arreglo bidemensional que corresponde a la representacion del mes. Cada fila es un agente y cada columna un día del mes
*/
function generateMonthArray(year, month, table_id, vacations_array = []) {
    console.log("GENERATE MONTH ARRAY");
    // Verificar que el numero de agentes corresponda la cantidad mayor definida
    // dada en el input de agentes o en la cantidad que haya en el archivo del mes subido
    let qty = 0;
    if (vacations_array.length > 0) {
        if (vacations_array[vacations_array.length - 1].length === 1) {
            qty = vacations_array.length - 2;
        } else {
            qty = vacations_array.length - 1;
        }
    }
    if (consultants < qty) {
        consultants = qty;
        consultant_input.value = qty;
    }
    // Definir los días bloqueados desde el principio del primer mes
    if (month === parseInt(month_picker.value.split("-").pop())) {
        let remainders = 0;
        if (blocking_days > 0) {
            remainders = blocking_days;
        }
        for (let i = 0; i < consultants; i++) {
            day_remainder.push(remainders);
        }
    }
    // Llenado del mes con los datos (vacaciones (v) y dias bloqueados (db)) del archivo subido, si es que hay
    let days = getNumberOFDaysByMonth(year, month);
    let month_array = [];
    if (vacations_array.length > 0) {
        let v_cols_len = vacations_array[0].length;
        // Iterando sobre el archivo subido
        for (let i = 1; i < vacations_array.length; i++) {
            if (vacations_array[i].length === v_cols_len) {
                // Llenando el mes con días pendientes que serán definidos posteriormente 
                month_array.push(Array(days).fill("p"));
                // Iterando sobre el archivo subido para llenar las vacacione y dias bloqueados
                for (let j = 3; j < v_cols_len; j++) {
                    if (vacations_array[i][j] === "v") {
                        month_array[i - 1][j - 3] = "v";
                    } else if (vacations_array[i][j] === "db") {
                        month_array[i - 1][j - 3] = "db";
                    }
                    else {
                        month_array[i - 1][j - 3] = "f";
                    }
                }
            }
        }
    }
    // Llenar con dias libres en caso de que no haya archivo
    let real_consultants = month_array.length;
    for (let i = 0; i < consultants - real_consultants; i++) {
        month_array.push(Array(days).fill("f"));
    }
    // Calcular el estatus de cada día
    let day_status;
    for (let i = 1; i <= days; i++) {
        day_status = calculateDayStatus(i, month, year);
        if (day_status === "h" || day_status === "w") {
            for (let j = 0; j < month_array.length; j++) {
                month_array[j][i - 1] = day_status;
            }
        }
    }
    // Verificar si hay días deshabilitados manualmente en el mes
    if (disabled_days_array.length > 0) {
        for (let i = 0; i < disabled_days_array.length; i++) {
            if (disabled_days_array[i][0] === table_id) {
                for (let j = 0; j < month_array.length; j++) {
                    if (month_array[j][disabled_days_array[i][1] - 1] !== "v") {
                        month_array[j][disabled_days_array[i][1] - 1] = "rem";
                    }
                }
            }
        }
    }
    return month_array;
}

// Funcion que regresa cuantas veces aparece un valor en un arreglo unidimensional
/*
    arr - arreglo unidimensional
    value - valor a contar su frecuencia

    Retorna:
    El número de veces que se encontró el valor en el arreglo
*/
function getFrequency(arr, value) {
    let count = 0;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === value) count++;
    }
    return count;
}

// Funcion que llena el arreglo del mes de un color especifico considerando su intervalo y color
/* 
    color_count - cantidad de veces que se tiene que "colorear"
    count_free - cantidad de días libres que tengo para "colorear" en el mes
    color_inter - cantidad de días de intervalo entre cada instancia del color
    month_arr - arreglo bidimensional que representa el mes
    color - nombre del color a colorear (g, y, o, r)

    Retorna:
    arreglo que contiene cuántos días se colorearon y cuántos se llenaron en general (contando intervalos)
*/
function fillColor(color_count, count_free, color_inter, month_arr, color) {
    let filled = 0;
    let colored = 0;
    let j = 0;
    while ((color_count > 0) && (count_free > 0)) {
        for (let i = 0; i < month_arr.length; i++) { // iterando sobre filas del arreglo (agentes)
            if ((color_count > 0) && (count_free > 0)) {
                // i - fila/agente, j - columna/día
                // Verificando que el día sea libre
                if (month_arr[i][j] === "f") {
                    month_arr[i][j] = color;
                    count_free--;
                    color_count--;
                    filled++;
                    colored++;
                    // Evaluando el intervalo entre cada visita
                    if (color_inter > 0) {
                        let temp_j = j + 1;
                        for (let l = 0; l < color_inter; l++) {
                            if (temp_j > month_arr[0].length) {
                                day_remainder[i] += 1;
                            }
                            else if (month_arr[i][temp_j] === "f") {
                                month_arr[i][temp_j] = "s";
                                count_free--;
                                filled++;
                            }
                            temp_j++;
                        }
                    }
                }
            } else {
                break;
            }
        }
        j++;
    }
    return [colored, filled];
}

// Funcion que se encarga de ocupar todos los días del mes con los diferentes colores que sean posbiles
/* 
    g - numero de verdes a llenar
    y - numero de amarillas a llenar
    o - numero de naranjas a llenar
    r - numero de rojas a llenar
    g_inter - intervalo entre cada verde
    y_inter - intervalo entre cada amarilla
    o_inter - intervalo entre cada naranja
    r_inter - intervalo entre cada roja
    suc - total de visitas a realizar
    month_arr - arreglo bidimensional que representa el mes

    Retorna:
    Arreglo que contiene:
    month_arr, [g, y, o, r, suc, count_g, count_y, count_o, count_r, count_suc, temp_count_rem]
    month_arr - arreglo del mes despues de ser llenado
    g - restantes verdes por llenar
    o - restantes naranjas por llenar
    y - restantes amarillas por llenar
    r - restantes rojas por llenar
    count_g - cuantas verdes fueron llenadas
    count_o - cuantas naranjas fueron llenadas
    count_y - cuantas amarillas fueron llenadas
    count_r - cuantas rojas fueron llenadas
    count_suc - cuantas fueron llenadas en total (sin contar intervalos)
    temp_count_rem - cuantas remotas se llenaron en el mes
*/
function generateMonthSchedule(g, y, o, r, g_inter, y_inter, o_inter, r_inter, suc, month_arr) {
    let day_st_start = "s";
    // Verificar que no haya días bloqueados al principio
    // o remanentes de intervalo del llenado de un mes anterior
    for (let i = 0; i < day_remainder.length; i++) {
        for (let j = 0; j < day_remainder[i]; j++) {
            if (month_arr[i][j] === "f") {
                if (blocking_days > 0) {
                    if (fill_remotes) {
                        day_st_start = "rem";
                    } else {
                        day_st_start = "db";
                    }
                }
                month_arr[i][j] = day_st_start;
            }
        }
        day_remainder[i] = 0;
    }
    // Si hubo días bloqueados al principio, ponerlos en cero para que no afecte la evaluacion de meses posteriores
    if (blocking_days > 0) {
        blocking_days = 0;
    }
    // Inicializar todas las variables
    let count_g = 0;
    let count_y = 0;
    let count_o = 0;
    let count_r = 0;
    let count_suc = 0;
    let count_free = 0;
    // Contar cuantos dias libres tengo en el mes
    for (let i = 0; i < month_arr.length; i++) {
        count_free += getFrequency(month_arr[i], "f");
    }
    // Llenar verdes y contar días llenados y coloreados
    let count_temp;
    count_temp = fillColor(g, count_free, g_inter, month_arr, "g");
    count_free -= count_temp[1];
    count_g += count_temp[0];
    count_suc += count_temp[0];
    // Llenar amarillas y contar días llenados y coloreados
    count_temp = fillColor(y, count_free, y_inter, month_arr, "y");
    count_free -= count_temp[1];
    count_y += count_temp[0];
    count_suc += count_temp[0];
    // Llenar naranjas y contar días llenados y coloreados
    count_temp = fillColor(o, count_free, o_inter, month_arr, "o");
    count_free -= count_temp[1];
    count_o += count_temp[0];
    count_suc += count_temp[0];
    // Llenar rojas y contar días llenados y coloreados
    count_temp = fillColor(r, count_free, r_inter, month_arr, "r");
    count_free -= count_temp[1];
    count_r += count_temp[0];
    count_suc += count_temp[0];
    // convertir los intervalos y/o días libres restantes en visitas remotas
    let temp_count_rem = 0;
    for (let i = 0; i < month_arr.length; i++) {
        for (let j = 0; j < month_arr[0].length; j++) {
            if (month_arr[i][j] === "f" || month_arr[i][j] === "s") {
                month_arr[i][j] = "rem";
                temp_count_rem++;
            }
        }
    }
    count_rem += temp_count_rem;
    return [month_arr, [g, y, o, r, suc, count_g, count_y, count_o, count_r, count_suc, temp_count_rem]];
}
// Objeto constante que almacena los días festivos de del año
/*
    AÑO: {
        MES:DIA
    }
*/
const LAW_DAYS = {
    2021: {
        1: 1,
        2: 1,
        3: 15,
        5: 1,
        9: 16,
        11: 15,
        12: 25
    },
    2022: {
        1: 1,
        2: 7,
        3: 21,
        5: 1,
        9: 16,
        11: 21,
        12: 25
    },
    2023: {
        1: 1,
        12: 25
    }
};

// Funcion que evalua si el valor de una cadena es numerico
/*
    str - cadena a evaluar
    
    Retorna:
    Booleano de la evaluación
*/
function isNumeric(str) {
    if (typeof str != "string") return false
    return !isNaN(str) &&
        !isNaN(parseFloat(str))
}

// Funcion que convierte y descarga un excel a partir de tabla html
/* 
    id - id del div que contiene la tabla html a convertir
*/
function fnExcelReport(id) {
    let tab_text = "<table border='2px'><tr>";
    let textRange;
    let j = 0;
    tab = document.getElementById(id).children[0]; // id of table

    for (j = 0; j < tab.rows.length; j++) {
        tab_text = tab_text + tab.rows[j].innerHTML + "</tr>";
    }

    tab_text = tab_text + "</table>";
    tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, ""); //remove if u want links in your table
    tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if u want images in your table
    tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // reomves input params

    let ua = window.navigator.userAgent;
    let msie = ua.indexOf("MSIE ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
        // If Internet Explorer
        txtArea1.document.open("txt/html", "replace");
        txtArea1.document.write(tab_text);
        txtArea1.document.close();
        txtArea1.focus();
        sa = txtArea1.document.execCommand(
            "SaveAs",
            true,
            "watafak.xls"
        );
    } //other browser not tested on IE 11
    else
        sa = window.open(
            "data:application/vnd.ms-excel," + encodeURIComponent(tab_text)
        );
}