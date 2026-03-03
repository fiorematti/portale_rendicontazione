/** Rappresenta un'automobile con i dati tecnici e la tariffa chilometrica. */
export interface AutomobileDto {
	idauto: number;
	marca: string;
	modello: string;
	targa: string;
	/** Costo per chilometro (€/km). */
	tariffaChilometrica: number;
	cilindrata: number;
}
