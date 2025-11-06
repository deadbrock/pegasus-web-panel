"use client"

import * as React from "react"
import { DayPicker, CaptionProps } from "react-day-picker"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ptBR } from "date-fns/locale"
import { format } from "date-fns"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Componente customizado para o caption com seletores de mês/ano
function CustomCaption({ displayMonth }: CaptionProps) {
  const [month, setMonth] = React.useState(displayMonth.getMonth())
  const [year, setYear] = React.useState(displayMonth.getFullYear())

  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ]

  // Gerar anos (10 anos atrás até 10 anos à frente)
  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i)

  return (
    <div className="flex justify-center items-center gap-2 mb-4">
      <Select
        value={month.toString()}
        onValueChange={(value) => {
          setMonth(parseInt(value))
          const newDate = new Date(year, parseInt(value), 1)
          displayMonth.setMonth(parseInt(value))
        }}
      >
        <SelectTrigger className="w-[130px] h-8">
          <SelectValue>{months[month]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {months.map((m, i) => (
            <SelectItem key={i} value={i.toString()}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={year.toString()}
        onValueChange={(value) => {
          setYear(parseInt(value))
          const newDate = new Date(parseInt(value), month, 1)
          displayMonth.setFullYear(parseInt(value))
        }}
      >
        <SelectTrigger className="w-[100px] h-8">
          <SelectValue>{year}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {years.map((y) => (
            <SelectItem key={y} value={y.toString()}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

// Componente para formatar os nomes dos dias da semana
function CustomHead() {
  const diasSemana = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
  
  return (
    <thead>
      <tr className="flex">
        {diasSemana.map((dia, i) => (
          <th
            key={i}
            className="text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] text-center"
          >
            {dia}
          </th>
        ))}
      </tr>
    </thead>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={ptBR}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium capitalize",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-10 font-medium text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        Head: CustomHead,
      }}
      formatters={{
        formatWeekdayName: (date) => {
          const dias = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"]
          return dias[date.getDay()]
        },
        formatCaption: (date) => {
          const meses = [
            "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
            "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
          ]
          return `${meses[date.getMonth()]} ${date.getFullYear()}`
        }
      }}
      captionLayout="dropdown"
      fromYear={new Date().getFullYear() - 10}
      toYear={new Date().getFullYear() + 10}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
