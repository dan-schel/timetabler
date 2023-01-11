import { areUnique, arraysMatch } from "schel-d-utils";
import { z } from "zod";
import { Timetable, version } from "./timetable";
import { TimetableBlock } from "./timetable-block";
import { TimetableClass } from "./timetable-class";
import { TimetableError } from "./timetable-error";
import { TimetableOption } from "./timetable-option";

/** A mapping between a block and a choice. */
export type ClashingBlock = { block: TimetableBlock, choice: TimetableChoice };

/**
 * Stores the timetable as well as the currently selected choices for each class
 * in the timetable.
 */
export class TimetableChoices {
  /** The timetable. */
  readonly timetable: Timetable;

  /**
   * The choices for each class. There must be a choice present representing
   * each class in the timetable.
   */
  readonly choices: readonly TimetableChoice[];

  /** Zod schema for parsing from JSON. */
  static readonly json = z.object({
    version: z.string().refine(s => s == version, {
      message: `Only version '${version}' timetables are supported`
    }),
    classes: TimetableClass.json.array(),
    choices: z.union([z.number().int(), z.null()]).array().optional()
  }).transform(x =>
    TimetableChoices.fromIndices(new Timetable(x.classes), x.choices ?? null)
  );

  /** Zod schema for parsing from JSON but only using raw types. */
  static readonly rawJson = z.object({
    $schema: z.string(),
    version: z.string(),
    classes: TimetableClass.rawJson.array(),
    choices: z.union([z.number(), z.null()]).array().optional()
  });

  /**
   * Creates a {@link TimetableChoices}.
   * @param timetable The timetable.
   * @param choices The choices for each class. There must be a choice present
   * representing each class in the timetable.
   */
  constructor(timetable: Timetable, choices: TimetableChoice[]) {
    // Check that the classes present in the choices array match the classes
    // in the timetable. Either array cannot have an element the other does not.
    const choicesMatch = arraysMatch(
      choices.map(c => c.timetableClass),
      timetable.classes as TimetableClass[],
      (a, b) => a.equals(b)
    );

    if (!choicesMatch) {
      throw TimetableError.classesChoicesMismatch();
    }

    // Check no classes are present twice in the choices array.
    if (!areUnique(choices.map(c => c.timetableClass), (a, b) => a.equals(b))) {
      throw TimetableError.duplicatedClassInChoices();
    }

    this.timetable = timetable;
    this.choices = choices;
  }

  /**
   * Creates a {@link TimetableChoices} from a timetable and optional array of
   * choice indices.
   * @param timetable The timetable.
   * @param indices The choices indices for each class. There must be a choice
   * present representing each class in the timetable.
   */
  static fromIndices(timetable: Timetable,
    indices: (number | null)[] | null): TimetableChoices {

    if (indices == null) {
      return new TimetableChoices(
        timetable, timetable.classes.map(c => new TimetableChoice(c, null))
      );
    }

    if (indices.length != timetable.classes.length) {
      throw TimetableError.badChoiceArrayLength();
    }

    return new TimetableChoices(
      timetable,
      timetable.classes.map((c, i) => TimetableChoice.fromIndex(c, indices[i]))
    );
  }

  /** Convert to JSON object according to {@link TimetableChoices.rawJson}. */
  toJSON(): z.infer<typeof TimetableChoices.rawJson> {
    let choices: (number | null)[] | undefined = undefined;

    // Only create the choices array if some choices have been made.
    if (this.choices.some(c => c.option != null)) {
      // Create the array by finding the index of each option in each class,
      // in the order the classes are in the timetable.
      choices = this.timetable.classes.map(cl => {
        const choice = this.choices.find(ch => ch.timetableClass == cl);

        // Wont happen. The constructor ensures all classes have choices.
        if (choice == null) { throw new Error(); }

        const option = choice.option;
        if (option == null) { return null; }

        const optionIndex = cl.options.findIndex(o => o.equals(option));
        return optionIndex;
      });
    }

    return {
      ...this.timetable.toJSON(),
      choices: choices
    };
  }

  /**
   * Creates a new {@link TimetableChoices} object that is identical, except
   * that it has the given option for the given class chosen.
   * @param timetableClass The class to change the choice for.
   * @param option The new choice (or null for no choice).
   */
  withChoice(timetableClass: TimetableClass,
    option: TimetableOption | null): TimetableChoices {

    const choices = this.choices.map(ch => {
      // If this is the class to modify, change the option.
      if (ch.timetableClass == timetableClass) {
        return new TimetableChoice(timetableClass, option);
      }

      // Otherwise return the existing choice.
      return ch;
    });

    return new TimetableChoices(this.timetable, choices);
  }

  /**
   * Returns a new {@link TimetableChoices} that is identical, except with the
   * given class added.
   * @param newClass The new class to add.
   * @param replace The old class to replace (if any). If this class is not
   * found within the timetable, then nothing will change.
   */
  withClass(newClass: TimetableClass, replace?: TimetableClass): TimetableChoices {
    const newTimetable = this.timetable.withClass(newClass, replace);

    const newChoices = (() => {
      if (replace != null) {
        // Find the choice for the old class and change it to the new class.
        return this.choices.map(ch => {
          // Don't change any choices for any other classes.
          if (!ch.timetableClass.equals(replace)) {
            return ch;
          }

          // Keep the same option chosen if the new class still has it.
          const prevOption = ch.option;
          if (prevOption != null && newClass.options.some(o => o.equals(prevOption))) {
            return new TimetableChoice(newClass, prevOption);
          }

          // Otherwise select nothing.
          return new TimetableChoice(newClass, null);
        });
      }
      return [...this.choices, new TimetableChoice(newClass, null)];
    })();

    return new TimetableChoices(newTimetable, newChoices);
  }

  /**
   * Returns a new {@link TimetableChoices} that is identical, except with the
   * given class removed.
   * @param oldClass The class to remove.
   */
  withoutClass(oldClass: TimetableClass): TimetableChoices {
    const newTimetable = this.timetable.withoutClass(oldClass);
    const newChoices = this.choices.filter(
      c => !c.timetableClass.equals(oldClass)
    );
    return new TimetableChoices(newTimetable, newChoices);
  }

  /** Returns a list of all blocks that are part of clashes. */
  clashingBlocks(): ClashingBlock[] {
    const result: ClashingBlock[] = [];

    this.choices.forEach(ch => {
      // It can't clash if nothing's been chosen.
      if (ch.option == null) { return; }

      // Work out which blocks from this class clash with other choices.
      const clashingBlocks = ch.option.blocks.filter(b =>
        this.choices.some(other => {
          // We only want to compare with other choices in the list (so skip
          // this one) that have options chosen (so skip nulls).
          if (other == ch || other.option == null) { return false; }

          // If any block from this choice clashes this block, it's a clash.
          return other.option.blocks.some(otherB => otherB.clashesWith(b));
        })
      );

      clashingBlocks.forEach(b => {
        result.push({ block: b, choice: ch });
      });
    });

    return result;
  }

  /**
   * Returns a list of all classes that aren't optional, but have no option
   * chosen.
   */
  unallocatedMandatoryClasses(): TimetableClass[] {
    return this.choices
      .filter(x => !x.timetableClass.optional && x.option == null)
      .map(x => x.timetableClass);
  }
}

/** Represents a choice (or no choice) made for a class in the timetable. */
export class TimetableChoice {
  /** The class the choice is made for. */
  readonly timetableClass: TimetableClass;

  /**
   * The choice made, or null if no choice is made. Note that null may be a
   * valid choice for an optional class.
   */
  readonly option: TimetableOption | null;

  /**
   * Creates a {@link TimetableChoice}.
   * @param timetableClass The class the choice is made for.
   * @param option The choice made, or null if no choice is made. Note that null
   * may be a valid choice for an optional class.
   */
  constructor(timetableClass: TimetableClass, option: TimetableOption | null) {
    if (option != null && !timetableClass.options.some(o => o.equals(option))) {
      throw TimetableError.optionMissing();
    }

    this.timetableClass = timetableClass;
    this.option = option;
  }

  /**
   * Creates a {@link TimetableChoice} from a class and index.
   * @param timetableClass The class the choice is made for.
   * @param index The index of the option chosen, or null if no choice is made.
   * Note that null may be a valid choice for an optional class.
   */
  static fromIndex(timetableClass: TimetableClass,
    index: number | null): TimetableChoice {

    if (index == null) {
      return new TimetableChoice(timetableClass, null);
    }

    if (!Number.isInteger(index) || index < 0 ||
      index >= timetableClass.options.length) {

      throw TimetableError.badChoiceIndex(index);
    }

    return new TimetableChoice(timetableClass, timetableClass.options[index]);
  }
}
